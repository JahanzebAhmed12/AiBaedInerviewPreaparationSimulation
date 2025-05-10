import { createContext, useContext, useEffect, useState, useRef } from "react";

const backendUrl = "http://localhost:8000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const chat = async (message) => {
    setLoading(true);
    const data = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    const resp = (await data.json()).messages;
    setMessages((messages) => [...messages, ...resp]);
    setLoading(false);
  };

  // Audio recording functionality
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const wsRef = useRef(null);

  // Open WebSocket connection for audio streaming
  const openWebSocketConnection = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const interviewDetails = localStorage.getItem('interviewDetails');
    const parsedDetails = interviewDetails ? JSON.parse(interviewDetails) : { interviewField: 'General' };

    // Construct WebSocket URL with token and interview field
    const wsUrl = `ws://localhost:8000/simulation_listen?token=${token}&interviewField=${encodeURIComponent(parsedDetails.interviewField)}`;
    
    console.log('Opening WebSocket connection...');
    wsRef.current = new WebSocket(wsUrl);
    wsRef.current.binaryType = 'arraybuffer';
    wsRef.current.onopen = () => {
      console.log("WebSocket connection opened for audio");
    };

    wsRef.current.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        // Handle audio response from server
        // This would be implemented if needed
      } else {
        // Handle text messages from server
        try {
          const message = JSON.parse(event.data);
          console.log("Received WebSocket message:", message);
          
          // Handle different message types from the backend
          if (message.type === 'transcript_final') {
            // Add the transcribed text to messages
            setMessages((messages) => [...messages, { role: 'user', content: message.content }]);
          } else if (message.type === 'transcript_interim') {
            // Handle interim transcripts if needed
            console.log("Interim transcript:", message.content);
          } else if (message.messages) {
            // Handle full message responses from the backend
            console.log("Processing messages array:", message.messages);
            
            // Process each message to ensure it has the required properties
            const processedMessages = message.messages.map(msg => {
              console.log("Processing message:", msg);
              return {
                text: msg.text || "No text available",
                facialExpression: msg.facialExpression || "smile",
                animation: msg.animation || "Talking_1",
                audio: msg.audio || null,
                lipsync: msg.lipsync || null
              };
            });
            
            setMessages((messages) => [...messages, ...processedMessages]);
          } else if (message.type === 'finish') {
            // Handle conversation end
            console.log("Conversation finished");
            stopRecording();
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }
    };

    wsRef.current.onclose = () => {
      stopRecording();
    };
  };

  // Close WebSocket connection
  const closeWebSocketConnection = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // Start microphone recording
  const startRecording = async () => {
    try {
      if (mediaRecorderRef.current) {
        stopRecording();
      }
      
      const audioConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          channelCount: 1
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      
      // Create media recorder from the stream
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const onDataAvailable = (e) => {
        if (e.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(e.data);
        }
      };
      
      mediaRecorderRef.current.addEventListener('dataavailable', onDataAvailable);
      mediaRecorderRef.current.start(250);
      
      mediaRecorderRef.current.addEventListener('stop', () => {
        mediaRecorderRef.current?.removeEventListener('dataavailable', onDataAvailable);
      });

      setIsRecording(true);
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Stop microphone recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    setIsListening(false);
    closeWebSocketConnection();
  };

  // Toggle listening state
  const toggleListening = () => {
    if (!mediaRecorderRef.current) return;

    if (isListening) {
      mediaRecorderRef.current.pause();
    } else {
      mediaRecorderRef.current.resume();
      if (mediaRecorderRef.current.state === 'inactive') {
        startRecording();
      }
    }
    setIsListening(!isListening);
  };

  // Start audio conversation
  const startAudioConversation = async () => {
    try {
      openWebSocketConnection();
      await startRecording();
    } catch (err) {
      console.error('Error starting audio conversation:', err);
      stopRecording();
    }
  };

  // End audio conversation
  const endAudioConversation = () => {
    stopRecording();
  };

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      console.log("Setting current message:", messages[0]);
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        // Audio recording functionality
        isRecording,
        isListening,
        startAudioConversation,
        endAudioConversation,
        toggleListening
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
