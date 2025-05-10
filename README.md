# AI Interview Simulation Platform

An interactive AI-powered interview simulation platform that conducts professional interviews with real-time speech-to-text and text-to-speech capabilities.

## Features

- Real-time speech-to-text conversion
- AI-powered interview questions
- Dynamic facial expressions and animations
- Field-specific interview scenarios
- Comprehensive feedback and scoring
- Real-time audio processing
- Lip-sync capabilities

## Tech Stack

### Backend
- FastAPI
- Python 3.8+
- Deepgram API for speech-to-text
- Groq API for LLM
- WebSocket for real-time communication

### Frontend
- React
- TypeScript
- WebSocket client
- Audio processing

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- Deepgram API key
- Groq API key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
DEEPGRAM_API_KEY=your_deepgram_api_key
GROQ_API_KEY=your_groq_api_key
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn fastapi_app.main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Project Structure

```
├── backend/
│   ├── fastapi_app/
│   │   ├── models/
│   │   ├── routes/
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── .gitignore
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Deepgram for speech-to-text capabilities
- Groq for LLM services
- FastAPI for the backend framework
- React for the frontend framework 