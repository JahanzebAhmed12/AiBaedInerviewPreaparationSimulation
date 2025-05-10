from fastapi import FastAPI, HTTPException, File, WebSocket,  Form, Query
# from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
# from fastapi_app.ai_models.proper_working_model import LanguageModelProcessor, text_to_speech, get_transcript, ConversationManager
from fastapi_app.base_model import PromptRequest
from fastapi_app.models.preparation_model import generate_model_response
from fastapi_app.models.new_model import Assistant
from fastapi_app.config import settings
import asyncio
# from fastapi_app.models.simulation_model import chat as simulation_chat
from fastapi_app.models.simulation_model import handle_websocket_connection
import jwt
from uuid import uuid4
from typing import Optional
from fastapi_app.settings import settings

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add JWT secret key to settings


FLASK_API_URL = "http://127.0.0.1:5000/api"


@app.head('/health')
@app.get('/health')
def health_check():
    return 'ok'


# In your FastAPI app


@app.websocket('/listen')
async def websocket_listen(websocket: WebSocket):
    await websocket.accept()
    user_id = 9  # Replace with actual user_id (e.g., from authentication)
    interview_id = 9  # Replace with actual interview_id (e.g., from request)
    assistant = Assistant(websocket, user_id, interview_id)
    try:
        await asyncio.wait_for(assistant.run(), timeout=300)
    except TimeoutError:
        print('Connection timeout')


@app.websocket('/simulation_listen')
async def simulation_websocket_listen(websocket: WebSocket, token: Optional[str] = Query(None), interviewField: str = Query("General")):
    if not token:
        await websocket.close(code=4001, reason="No authentication token provided")
        return

    try:
        # Decode the JWT token using JWT_SECRET from settings
        decoded_token = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = decoded_token.get("user_id")
        
        if not user_id:
            await websocket.close(code=4002, reason="Invalid token: no user_id found")
            return

        # Generate a new interview ID using UUID
        interview_id = str(uuid4())

        await websocket.accept()
        try:
            await asyncio.wait_for(
                handle_websocket_connection(websocket, user_id, interview_id, interviewField),
                timeout=300
            )
        except TimeoutError:
            print('Connection timeout')
    except jwt.InvalidTokenError:
        await websocket.close(code=4003, reason="Invalid token")
    except Exception as e:
        print(f"Error in simulation_websocket_listen: {str(e)}")
        await websocket.close(code=4004, reason="Internal server error")


@app.post("/generate_prompt/")
async def generate_prompt(request: PromptRequest):
    try:
        response = generate_model_response(
            mainField=request.mainField,
            subField=request.subField,
            difficulty=request.difficulty
        )
        return {"generated_content": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add the chat endpoint from simulation_model.py
# @app.post("/chat")
# async def chat_endpoint(request: dict):
#     try:
#         print(f"Received request: {request}")  # Debug log
#         return await simulation_chat(request)
#     except Exception as e:
#         import traceback
#         error_details = traceback.format_exc()
#         print(f"Error in chat_endpoint: {str(e)}")
#         print(f"Traceback: {error_details}")
#         raise HTTPException(
#             status_code=500,
#             detail={
#                 "error": str(e),
#                 "traceback": error_details,
#                 "request": request
#             }
#         )
