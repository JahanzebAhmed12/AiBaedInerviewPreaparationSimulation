from fastapi import HTTPException
from pydantic import BaseModel
import os
import base64
import json
import asyncio
import aiohttp
import subprocess
import re
import string
from typing import List, Optional
from dotenv import load_dotenv
import shutil
from starlette.websockets import WebSocketDisconnect, WebSocketState
from deepgram import (
    DeepgramClient, DeepgramClientOptions, LiveTranscriptionEvents, LiveOptions
)
from groq import AsyncGroq
import requests
import traceback

# Load environment variables
load_dotenv()

# Configuration
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DEEPGRAM_TTS_URL = "https://api.deepgram.com/v1/speak?model=aura-luna-en"

# Get the directory where this file is located
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(MODEL_DIR, "audios")
BIN_DIR = os.path.join(MODEL_DIR, "bin")

# Ensure directories exist
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(BIN_DIR, exist_ok=True)

# Deepgram configuration for speech-to-text
deepgram_config = DeepgramClientOptions(options={'keepalive': 'true'})
deepgram = DeepgramClient(DEEPGRAM_API_KEY, config=deepgram_config)
dg_connection_options = LiveOptions(
    model='nova-2',
    language='en',
    # Apply smart formatting to the output
    smart_format=True,
    # To get UtteranceEnd, the following must be set:
    interim_results=True,
    utterance_end_ms='1300',
    vad_events=True,
    # Time in milliseconds of silence to wait for before finalizing speech
    endpointing=4500,
)
groq = AsyncGroq(api_key=GROQ_API_KEY)

class ChatRequest(BaseModel):
    message: Optional[str] = None

class Message(BaseModel):
    text: str
    facialExpression: str
    animation: str
    audio: Optional[str] = None
    lipsync: Optional[dict] = None

# New class for handling real-time speech-to-text
class SpeechToTextHandler:
    def __init__(self, websocket, user_id, interview_id, interview_field, memory_size=10):
        self.websocket = websocket
        self.user_id = user_id  
        self.interview_id = interview_id 
        self.interview_field = interview_field
        self.transcript_parts = []
        self.transcript_queue = asyncio.Queue()
        self.chat_messages = [
            {
                "role": "system",
                "content": f"""You are an AI interviewer conducting professional interview simulations for the {interview_field} field. Follow these guidelines:

1. Interview Flow:
   - Greet briefly, ask name and expertise in {interview_field}
   - Ask 5 balanced questions specific to {interview_field} (mix of simple/technical) one at a time
   - Keep responses 1-2 lines max but complete the question
   - After completing all questions, generate a structured report with:
     * SCORE: Overall performance score (0-100)
     * STRENGTHS: List 2-3 key strengths demonstrated in {interview_field}
     * WEAKNESSES: List 2-3 areas needing improvement in {interview_field}
     * AREAS TO IMPROVE: Provide specific actionable recommendations for {interview_field}
   - End with a polite conclusion

2. Response Format:
   - Return JSON with "messages" array
   - Each message must have: text, facialExpression, animation
   - Facial expressions: smile, sad, angry, surprised, funnyFace, default
   - Animations: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry

3. Guidelines:
   - Stay professional and focused on {interview_field}
   - Filter harmful content
   - Maintain confidentiality
   - Be fair and objective
   - Handle unclear inputs gracefully
   - Exit politely if requested
   - Only ask questions relevant to {interview_field}

Never include text outside JSON structure."""
            }
        ]
        self.memory_size = memory_size
        self.httpx_client = aiohttp.ClientSession()
        self.finish_event = asyncio.Event()
        self.connection_closed = False
        self.question_count = 0
        self.max_questions = 10
        self.interview_completed = False
        self.is_ai_speaking = False  # Flag to track when AI is speaking
    
    def should_end_conversation(self, text):
        text = text.translate(str.maketrans('', '', string.punctuation))
        text = text.strip().lower()
        # Check for end conversation keywords
        end_keywords = ['end interview', 'finish interview', 'stop interview', 'goodbye', 'bye', 'thank you', 'exit', 'quit']
        return any(keyword in text for keyword in end_keywords)
    
    async def text_to_speech(self, text):
        headers = {
            'Authorization': f'Token {DEEPGRAM_API_KEY}',
            'Content-Type': 'application/json'
        }
        async with self.httpx_client.post(
            DEEPGRAM_TTS_URL, headers=headers, json={'text': text}
        ) as res:
            if not res.ok:
                raise HTTPException(status_code=res.status, detail="Deepgram TTS failed")
            audio_data = await res.read()
            return base64.b64encode(audio_data).decode()
    
    async def send_json(self, data):
        """Safely send JSON data over the WebSocket connection"""
        if not self.connection_closed and self.websocket.client_state != WebSocketState.DISCONNECTED:
            try:
                await self.websocket.send_json(data)
            except Exception as e:
                print(f"Error sending JSON: {str(e)}")
                self.connection_closed = True
    
    async def transcribe_audio(self):
        async def on_message(self_handler, result, **kwargs):
            if self.connection_closed or self.is_ai_speaking:  # Skip if AI is speaking
                return
            
            sentence = result.channel.alternatives[0].transcript
            if len(sentence) == 0:
                return
            if result.is_final:
                print(f"\n[DEBUG] User speech input: {sentence}")
                self.transcript_parts.append(sentence)
                await self.transcript_queue.put({'type': 'transcript_final', 'content': sentence})
                if result.speech_final:
                    full_transcript = ' '.join(self.transcript_parts)
                    self.transcript_parts = []
                    await self.transcript_queue.put({'type': 'speech_final', 'content': full_transcript})
            else:
                await self.transcript_queue.put({'type': 'transcript_interim', 'content': sentence})

        async def on_utterance_end(self_handler, utterance_end, **kwargs):
            if self.connection_closed or self.is_ai_speaking:  # Skip if AI is speaking
                return
                
            if len(self.transcript_parts) > 0:
                full_transcript = ' '.join(self.transcript_parts)
                self.transcript_parts = []
                await self.transcript_queue.put({'type': 'speech_final', 'content': full_transcript})

        dg_connection = deepgram.listen.asynclive.v('1')
        dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
        dg_connection.on(LiveTranscriptionEvents.UtteranceEnd, on_utterance_end)
        if await dg_connection.start(dg_connection_options) is False:
            raise Exception('Failed to connect to Deepgram')
        
        try:
            while not self.finish_event.is_set() and not self.connection_closed:
                try:
                    data = await self.websocket.receive_bytes()
                    await dg_connection.send(data)
                except WebSocketDisconnect:
                    self.connection_closed = True
                    break
                except Exception as e:
                    break
        finally:
            await dg_connection.finish()

    async def save_response_to_db(self, human_response=None, llm_response=None):
        """Send user and AI responses to the Flask /save_response route."""
        try:
            # Extract text content from LLM response if it's a JSON string
            llm_text = None
            if llm_response:
                try:
                    if isinstance(llm_response, str):
                        parsed_response = json.loads(llm_response)
                        if isinstance(parsed_response, dict) and "messages" in parsed_response:
                            # Get the first message's text if available
                            messages = parsed_response["messages"]
                            if messages and isinstance(messages, list) and len(messages) > 0:
                                llm_text = messages[0].get("text", "")
                    else:
                        llm_text = str(llm_response)
                except json.JSONDecodeError:
                    llm_text = str(llm_response)

            data = {
                'user_id': self.user_id,
                'interview_id': self.interview_id,
                'human_response': human_response,
                'llm_response': llm_text
            }
            async with self.httpx_client.post('http://localhost:5000/save_response', json=data) as response:
                if response.status != 200:
                    pass
        except Exception as e:
            pass

    async def assistant_chat(self, messages, model='llama3-8b-8192'):
        try:
            async with aiohttp.ClientSession() as session:
                if model not in ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768']:
                    model = 'llama3-8b-8192'
                
                has_json_instruction = False
                for msg in messages:
                    if msg.get('role') == 'system' and 'json' in msg.get('content', '').lower():
                        has_json_instruction = True
                        break
                
                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": 0.6,
                    "max_tokens": 1000
                }
                
                if model in ['llama3-8b-8192', 'llama3-70b-8192']:
                    payload["response_format"] = {"type": "json_object"}
                    
                    if not has_json_instruction:
                        has_system_message = any(msg.get('role') == 'system' for msg in messages)
                        
                        if has_system_message:
                            for msg in messages:
                                if msg.get('role') == 'system':
                                    msg['content'] = msg.get('content', '') + "\n\nPlease respond in JSON format."
                                    break
                        else:
                            payload["messages"] = [
                                {"role": "system", "content": "Please respond in JSON format."}
                            ] + messages
                
                async with session.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json=payload
                ) as response:
                    if not response.ok:
                        error_text = await response.text()
                        return json.dumps({
                            "messages": [
                                {
                                    "text": "I'm having trouble processing your request right now. Please try again.",
                                    "facialExpression": "sad",
                                    "animation": "Talking_1"
                                }
                            ]
                        })
                    
                    completion = await response.json()
                    content = completion["choices"][0]["message"]["content"]
                    return content
        except Exception as e:
            return json.dumps({
                "messages": [
                    {
                        "text": "I'm having trouble processing your request right now. Please try again.",
                        "facialExpression": "sad",
                        "animation": "Talking_1"
                    }
                ]
            })

    async def generate_final_report(self):
        """Generate a structured final report"""
        try:
            print("\n[DEBUG] Generating final interview report...")
            report_prompt = {
                "role": "system",
                "content": """You are an AI interviewer. Generate a final interview report with the following structure:
                SCORE: (Give a score out of 100)
                STRENGTHS: (List 3-4 key strengths shown during the interview)
                WEAKNESSES: (List 2-3 areas where the candidate struggled)
                AREAS TO IMPROVE: (List 3-4 specific areas for improvement)
                CONCLUSION: (A polite conclusion thanking the candidate)

                IMPORTANT: Return the report in JSON format with a 'messages' array containing a single message with the report text."""
            }
            
            self.chat_messages.append(report_prompt)
            response = await self.assistant_chat(self.chat_messages[-self.memory_size:])
            print(f"\n[DEBUG] Raw response received: {response}")
            
            try:
                # Parse the response to extract structured data for database
                if isinstance(response, str):
                    try:
                        response = json.loads(response)
                    except json.JSONDecodeError:
                        # If not JSON, wrap it in our standard format
                        response = {
                            "messages": [{
                                "text": response,
                                "facialExpression": "smile",
                                "animation": "Talking_1"
                            }]
                        }
                
                if not isinstance(response, dict) or "messages" not in response:
                    raise ValueError("Invalid response format")
                
                # Initialize report data structure
                report_data = {
                    'SCORE': 0,
                    'STRENGTHS': [],
                    'WEAKNESSES': [],
                    'AREAS TO IMPROVE': [],
                    'CONCLUSION': "Thank you for completing the interview."
                }
                
                # Extract all messages and combine their text
                full_report = ""
                for message in response["messages"]:
                    if isinstance(message, dict) and "text" in message:
                        text_content = message["text"]
                        if isinstance(text_content, dict):
                            # If text is a dictionary, it's already in the correct format
                            report_data = text_content
                            break  # We found our structured data, no need to parse further
                        else:
                            full_report += str(text_content) + "\n"
                    elif isinstance(message, str):
                        full_report += message + "\n"
                    else:
                        print(f"\n[WARNING] Skipping invalid message format: {message}")
                
                # Only parse the text if we didn't get structured data directly
                if not any(report_data.values()):  # Check if we need to parse the text
                    # Parse the combined report text
                    lines = full_report.split('\n')
                    current_section = None
                    
                    for line in lines:
                        line = line.strip()
                        if not line:
                            continue
                        
                        # Extract score
                        if line.startswith('SCORE:'):
                            try:
                                score_text = line.replace('SCORE:', '').strip()
                                report_data['SCORE'] = int(''.join(filter(str.isdigit, score_text)))
                            except ValueError:
                                report_data['SCORE'] = 0
                        
                        # Extract strengths
                        elif line.startswith('STRENGTHS:'):
                            current_section = 'STRENGTHS'
                            content = line.replace('STRENGTHS:', '').strip()
                            if content:
                                # Split by commas and clean up each item
                                items = [item.strip() for item in content.split(',')]
                                report_data['STRENGTHS'] = items
                        
                        # Extract weaknesses
                        elif line.startswith('WEAKNESSES:'):
                            current_section = 'WEAKNESSES'
                            content = line.replace('WEAKNESSES:', '').strip()
                            if content:
                                # Split by commas and clean up each item
                                items = [item.strip() for item in content.split(',')]
                                report_data['WEAKNESSES'] = items
                        
                        # Extract areas to improve
                        elif line.startswith('AREAS TO IMPROVE:'):
                            current_section = 'AREAS TO IMPROVE'
                            content = line.replace('AREAS TO IMPROVE:', '').strip()
                            if content:
                                # Split by commas and clean up each item
                                items = [item.strip() for item in content.split(',')]
                                report_data['AREAS TO IMPROVE'] = items
                        
                        # Extract conclusion
                        elif line.startswith('CONCLUSION:'):
                            report_data['CONCLUSION'] = line.replace('CONCLUSION:', '').strip()
                
                # Prepare feedback data for database
                feedback_data = {
                    'user_id': int(self.user_id),
                    'interview_id': str(self.interview_id),
                    'interview_field': self.interview_field if self.interview_field else "General",  # Provide default if None
                    'score': report_data['SCORE'],
                    'strengths': json.dumps(report_data['STRENGTHS']),
                    'weaknesses': json.dumps(report_data['WEAKNESSES']),
                    'areas_to_improve': json.dumps(report_data['AREAS TO IMPROVE']),
                    'feedback_text': report_data['CONCLUSION']
                }
                
                # Send feedback to Flask backend
                try:
                    flask_response = requests.post(
                        'http://localhost:5000/save_feedback',
                        json=feedback_data
                    )
                    if flask_response.status_code == 200:
                        print("\n[DEBUG] Feedback saved successfully to database")
                    else:
                        print(f"\n[ERROR] Failed to save feedback: {flask_response.text}")
                except Exception as e:
                    print(f"\n[ERROR] Error sending feedback to Flask: {str(e)}")
                
                # Return the response in the expected format
                return response
                
            except Exception as e:
                print(f"\n[ERROR] Error processing report: {str(e)}")
                return {
                    "messages": [{
                        "text": "Error generating report. Please try again.",
                        "facialExpression": "sad",
                        "animation": "Talking_1"
                    }]
                }
                
        except Exception as e:
            print(f"\n[ERROR] Error generating final report: {str(e)}")
            print(f"Full error traceback: {traceback.format_exc()}")
            return {
                "messages": [{
                    "text": "Error generating report. Please try again.",
                    "facialExpression": "sad",
                    "animation": "Talking_1"
                }]
            }

    async def manage_conversation(self):
        while not self.finish_event.is_set() and not self.connection_closed:
            try:
                transcript = await self.transcript_queue.get()
                
                if transcript['type'] == 'speech_final':
                    # Only end interview if user explicitly requests it
                    if self.should_end_conversation(transcript['content']):
                        if not self.interview_completed:
                            print("\n[DEBUG] Interview ending triggered by user request")
                            # Generate final report
                            final_report = await self.generate_final_report()
                            
                            # Send the text report to the client
                            await self.send_json(final_report)
                            
                            # Save the report to database
                            await self.save_response_to_db(
                                human_response=transcript['content'],
                                llm_response=final_report
                            )
                            
                            self.interview_completed = True
                            self.finish_event.set()
                            await self.send_json({'type': 'finish'})
                            break

                    self.chat_messages.append({'role': 'user', 'content': transcript['content']})
                    
                    try:
                        self.is_ai_speaking = True  # Set flag before AI starts speaking
                        response = await self.assistant_chat(self.chat_messages[-self.memory_size:])
                        print(f"\n[DEBUG] Model response: {response}")
                        
                        try:
                            parsed = json.loads(response)
                            
                            if isinstance(parsed, dict) and "messages" in parsed:
                                messages = parsed.get("messages", [])
                            else:
                                text_content = response
                                if isinstance(parsed, dict):
                                    if "text" in parsed:
                                        text_content = parsed["text"]
                                    elif "content" in parsed:
                                        text_content = parsed["content"]
                                    elif "questions" in parsed:
                                        questions = parsed.get("questions", [])
                                        if questions:
                                            text_content = f"I have {len(questions)} questions for you:"
                                            for i, q in enumerate(questions[:3]):
                                                text_content += f"\n{i+1}. {q.get('question', '')}"
                                            if len(questions) > 3:
                                                text_content += f"\n...and {len(questions)-3} more."
                                
                                messages = [{"text": text_content, "facialExpression": "smile", "animation": "Talking_1"}]
                        except Exception as e:
                            messages = [{"text": response, "facialExpression": "smile", "animation": "Talking_1"}]
                        
                        for i, message in enumerate(messages):
                            audio_base64 = await self.text_to_speech(message["text"])
                            
                            audio_path = os.path.join(AUDIO_DIR, f"message_{i}.mp3")
                            with open(audio_path, "wb") as f:
                                f.write(base64.b64decode(audio_base64))
                            print(f"\n[DEBUG] Audio file created: {audio_path}")
                            
                            await lip_sync_message(i)
                            print(f"\n[DEBUG] Rhubarb processing completed for message_{i}")
                            
                            message["audio"] = audio_base64
                            message["lipsync"] = await read_json_transcript(f"message_{i}.json")
                        
                        await self.send_json({"messages": messages})
                        print("\n[DEBUG] Response sent back to client")
                       
                        await self.save_response_to_db(
                            human_response=transcript['content'],
                            llm_response=response
                        )

                        # Increment question count if this was a question
                        if not self.finish_event.is_set():
                            self.question_count += 1
                            
                    except Exception as e:
                        print(f"\n[ERROR] Error in conversation management: {str(e)}")
                        await self.send_json({
                            "messages": [
                                {
                                    "text": "I'm having trouble processing your request right now. Please try again.",
                                    "facialExpression": "sad",
                                    "animation": "Talking_1"
                                }
                            ]
                        })
                    finally:
                        self.is_ai_speaking = False  # Reset flag after AI finishes speaking
            except Exception as e:
                print(f"\n[ERROR] Error in main conversation loop: {str(e)}")
                if not self.connection_closed:
                    await self.send_json({
                        "messages": [
                            {
                                "text": "I'm having trouble processing your request right now. Please try again.",
                                "facialExpression": "sad",
                                "animation": "Talking_1"
                            }
                        ]
                    })
    
    async def run(self):
        try:
            await asyncio.gather(
                self.transcribe_audio(),
                self.manage_conversation()
            )
        except WebSocketDisconnect:
            pass
        except Exception as e:
            pass
        finally:
            self.connection_closed = True
            await self.httpx_client.close()
            if self.websocket.client_state != WebSocketState.DISCONNECTED:
                try:
                    await self.websocket.close()
                except:
                    pass

async def exec_command(command: str) -> str:
    try:
        process = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            check=False
        )
        
        if process.returncode != 0:
            error_msg = process.stderr if process.stderr else "Unknown error"
            raise Exception(f"Command failed: {error_msg}")
        
        return process.stdout
    except Exception as e:
        raise

async def text_to_speech(text: str) -> str:
    headers = {
        'Authorization': f'Token {DEEPGRAM_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            DEEPGRAM_TTS_URL,
            headers=headers,
            json={'text': text}
        ) as response:
            if not response.ok:
                raise HTTPException(status_code=response.status, detail="Deepgram TTS failed")
            audio_data = await response.read()
            return base64.b64encode(audio_data).decode()

async def lip_sync_message(message_index: int):
    try:
        time_start = asyncio.get_event_loop().time()
        
        input_mp3 = os.path.join(AUDIO_DIR, f"message_{message_index}.mp3")
        output_wav = os.path.join(AUDIO_DIR, f"message_{message_index}.wav")
        output_json = os.path.join(AUDIO_DIR, f"message_{message_index}.json")
        
        if not os.path.exists(input_mp3):
            print(f"\n[ERROR] Input file not found: {input_mp3}")
            raise FileNotFoundError(f"Input file {input_mp3} does not exist")
        
        ffmpeg_cmd = f'ffmpeg -y -i "{input_mp3}" "{output_wav}"'
        await exec_command(ffmpeg_cmd)
        
        if not os.path.exists(output_wav):
            print(f"\n[ERROR] Output WAV file not created: {output_wav}")
            raise FileNotFoundError(f"Output WAV file {output_wav} was not created")
        
        rhubarb_path = os.path.join(BIN_DIR, 'rhubarb.exe') if os.name == 'nt' else os.path.join(BIN_DIR, 'rhubarb')
        if not os.path.exists(rhubarb_path):
            print(f"\n[WARNING] Rhubarb executable not found at {rhubarb_path}, using dummy JSON")
            dummy_json = {
                "mouthCues": [
                    {"start": 0, "end": 1, "value": "A"}
                ]
            }
            with open(output_json, 'w') as f:
                json.dump(dummy_json, f)
            return
        
        rhubarb_cmd = f'"{rhubarb_path}" -f json -o "{output_json}" "{output_wav}" -r phonetic'
        await exec_command(rhubarb_cmd)
        print(f"\n[DEBUG] Rhubarb processing completed successfully for message_{message_index}")
    except Exception as e:
        print(f"\n[ERROR] Error in lip sync processing: {str(e)}")
        dummy_json = {
            "mouthCues": [
                {"start": 0, "end": 1, "value": "A"}
            ]
        }
        with open(os.path.join(AUDIO_DIR, f"message_{message_index}.json"), 'w') as f:
            json.dump(dummy_json, f)

async def read_json_transcript(file: str) -> dict:
    with open(os.path.join(AUDIO_DIR, file), 'r', encoding='utf-8') as f:
        return json.load(f)

async def audio_file_to_base64(file: str) -> str:
    with open(os.path.join(AUDIO_DIR, file), 'rb') as f:
        return base64.b64encode(f.read()).decode()


# WebSocket endpoint for real-time speech-to-text processing
async def handle_websocket_connection(websocket, user_id, interview_id, interview_field):
    """
    Handle WebSocket connection for real-time speech-to-text processing.
    
    Args:
        websocket: The WebSocket connection
        user_id: The user ID
        interview_id: The interview ID
        interviewField: The interview field
    """
    handler = SpeechToTextHandler(websocket, user_id, interview_id, interview_field)
    await handler.run() 
