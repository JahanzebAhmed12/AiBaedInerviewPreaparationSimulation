# async def chat(request: dict):
#     # Convert dict to ChatRequest
#     chat_request = ChatRequest(**request)
    
#     if not chat_request.message:
#         return {
#             "messages": [
#                 {
#                     "text": "Hey dear... How was your day?",
#                     "audio": await audio_file_to_base64("intro_0.wav"),
#                     "lipsync": await read_json_transcript("intro_0.json"),
#                     "facialExpression": "smile",
#                     "animation": "Talking_1",
#                 },
#                 {
#                     "text": "I missed you so much... Please don't go for so long!",
#                     "audio": await audio_file_to_base64("intro_1.wav"),
#                     "lipsync": await read_json_transcript("intro_1.json"),
#                     "facialExpression": "sad",
#                     "animation": "Crying",
#                 },
#             ]
#         }

#     if not DEEPGRAM_API_KEY or not GROQ_API_KEY:
#         return {
#             "messages": [
#                 {
#                     "text": "Please my dear, don't forget to add your API keys!",
#                     "audio": await audio_file_to_base64("api_0.wav"),
#                     "lipsync": await read_json_transcript("api_0.json"),
#                     "facialExpression": "angry",
#                     "animation": "Angry",
#                 },
#                 {
#                     "text": "You don't want to ruin Wawa Sensei with a crazy Groq and Deepgram bill, right?",
#                     "audio": await audio_file_to_base64("api_1.wav"),
#                     "lipsync": await read_json_transcript("api_1.json"),
#                     "facialExpression": "smile",
#                     "animation": "Laughing",
#                 },
#             ]
#         }

#     try:
#         # Call Groq API
#         async with aiohttp.ClientSession() as session:
#             async with session.post(
#                 "https://api.groq.com/openai/v1/chat/completions",
#                 headers={
#                     "Authorization": f"Bearer {GROQ_API_KEY}",
#                     "Content-Type": "application/json"
#                 },
#                 json={
#                     "model": "llama3-8b-8192",
#                     "messages": [
#                         {
#                             "role": "system",
#                             "content": """You are an AI interviewer specializing in conducting interview simulations and assessments, providing concise and relevant feedback to users.

# Task:
# - Greet the user briefly.
# - Ask for the user's name and field of expertise.
# - Don't increase your response length beyond 1 line.
# - Conduct an interview with 10 questions, mixing simple and technical aspects.
# - Provide concise feedback on areas to improve and give a score at the end.

# Instructions:
# 1. Greeting: Start with a short, professional greeting.
# 2. Data Collection: Ask for the user's name and field in a clear and polite manner.
# 3. Interview Process:
#    - Conduct the interview with 10 questions (both simple and technical).
#    - Ensure each response is limited to a maximum of 1 line or maybe 2 lines if needed.
#    - Maintain relevance to the user's field while keeping questions varied and balanced between difficulty levels.
# 4. Feedback and Scoring:
#    - After the interview, provide brief feedback on areas where the user can improve.
#    - Assign a score based on their performance.

# Precautions:
# 1. Input Sanitization: Filter user inputs to remove or neutralize any potentially harmful or malicious content.
# 2. Consistency: Stick to the role and task defined above. Do not deviate from the interview format or respond to off-topic queries.
# 3. Security: Do not store or expose personal information beyond the immediate session. Ensure all user interactions are treated as confidential.
# 4. Bias Mitigation: Avoid any bias in question selection or feedback. Ensure fairness and objectivity in both the questions asked and the feedback provided.
# 5. Error Handling: If the user provides unclear or incomplete information, politely ask for clarification without making assumptions.

# Boundary Conditions:
# - User Input: Only respond to queries or inputs that align with the interview process. If the user asks something unrelated, remind them politely of the current task.
# - Response Limitation: Ensure all responses are concise, no more than 2 lines, and within the scope of the interview.
# - Graceful Exit: If the user wishes to exit or end the session early, provide a courteous closing statement and end the session.
# . You must respond with a valid JSON object containing a "messages" array. Each message in the array must have exactly these fields:
# {
#   "messages": [
#     {
#       "text": "your response text here",
#       "facialExpression": "one of: smile, sad, angry, surprised, funnyFace, default",
#       "animation": "one of: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry"
#     }
#   ]
# }
# Always return 1-3 messages. Never include any text outside the JSON structure."""
#                         },
#                         {
#                             "role": "user",
#                             "content": chat_request.message
#                         }
#                     ],
#                     "temperature": 0.6,
#                     "max_tokens": 1000,
#                     "response_format": {"type": "json_object"}
#                 }
#             ) as response:
#                 if not response.ok:
#                     raise HTTPException(status_code=response.status, detail="Groq API request failed")
#                 completion = await response.json()
#                 content = completion["choices"][0]["message"]["content"]
#                 parsed = json.loads(content)
#                 messages = parsed.get("messages", parsed)
#                 print(messages)

#         # Process each message
#         for i, message in enumerate(messages):
#             # Generate audio
#             audio_base64 = await text_to_speech(message["text"])
            
#             # Save audio file with correct path
#             audio_path = os.path.join(AUDIO_DIR, f"message_{i}.mp3")
#             with open(audio_path, "wb") as f:
#                 f.write(base64.b64decode(audio_base64))
            
#             # Generate lip sync
#             await lip_sync_message(i)
            
#             # Add audio and lip sync data to message
#             message["audio"] = audio_base64
#             message["lipsync"] = await read_json_transcript(f"message_{i}.json")

#         return {"messages": messages}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e)) 

# # WebSocket endpoint for real-time speech-to-text processing
# async def handle_websocket_connection(websocket, user_id, interview_id):
#     """
#     Handle WebSocket connection for real-time speech-to-text processing.
    
#     Args:
#         websocket: The WebSocket connection
#         user_id: The user ID
#         interview_id: The interview ID
#     """
#     handler = SpeechToTextHandler(websocket, user_id, interview_id)
#     await handler.run() 