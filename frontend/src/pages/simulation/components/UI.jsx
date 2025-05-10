import { useRef, useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { 
    chat, 
    loading, 
    cameraZoomed, 
    setCameraZoomed, 
    message,
    isRecording,
    isListening,
    startAudioConversation,
    endAudioConversation,
    toggleListening
  } = useChat();

  // State to store responses from the backend
  const [responses, setResponses] = useState([]);
  const [interimTranscript, setInterimTranscript] = useState("");

  // Function to add a response to the display
  const addResponse = (response) => {
    setResponses(prev => [...prev, response]);
  };

  // Function to update the interim transcript
  const updateInterimTranscript = (text) => {
    setInterimTranscript(text);
  };

  // Safer WebSocket message handling
  useEffect(() => {
    try {
      // Create a custom event listener for WebSocket messages
      const handleWebSocketMessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            
            // Handle different message types
            if (data.type === 'transcript_interim') {
              updateInterimTranscript(data.content);
            } else if (data.type === 'transcript_final') {
              addResponse({ type: 'user', content: data.content });
              updateInterimTranscript("");
            } else if (data.messages) {
              data.messages.forEach(msg => {
                addResponse({ type: 'assistant', content: msg.text });
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        }
      };

      // Add the event listener to the window
      window.addEventListener('websocket-message', handleWebSocketMessage);

      // Clean up the event listener when the component unmounts
      return () => {
        window.removeEventListener('websocket-message', handleWebSocketMessage);
      };
    } catch (error) {
      console.error('Error setting up WebSocket message handling:', error);
    }
  }, []);

  // Create a custom event dispatcher for WebSocket messages
  useEffect(() => {
    try {
      // Store the original WebSocket prototype
      const originalWebSocket = window.WebSocket;
      
      // Create a custom WebSocket class that extends the original
      window.WebSocket = function(url, protocols) {
        const ws = new originalWebSocket(url, protocols);
        
        // Store the original onmessage handler
        const originalOnMessage = ws.onmessage;
        
        // Override the onmessage handler
        ws.onmessage = function(event) {
          // Call the original handler if it exists
          if (originalOnMessage) {
            originalOnMessage.call(this, event);
          }
          
          // Dispatch a custom event with the message data
          window.dispatchEvent(new CustomEvent('websocket-message', { detail: event }));
        };
        
        return ws;
      };
      
      // Copy over any static properties from the original WebSocket
      for (const prop in originalWebSocket) {
        if (originalWebSocket.hasOwnProperty(prop)) {
          window.WebSocket[prop] = originalWebSocket[prop];
        }
      }
      
      // Clean up when the component unmounts
      return () => {
        window.WebSocket = originalWebSocket;
      };
    } catch (error) {
      console.error('Error setting up WebSocket override:', error);
    }
  }, []);

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message) {
      chat(text);
      input.current.value = "";
    }
  };
  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl">My Virtual GF</h1>
          <p>I will always love you ❤️</p>
        </div>
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
          <button
            onClick={isRecording ? endAudioConversation : startAudioConversation}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {isRecording ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>
          {isRecording && (
            <button
              onClick={toggleListening}
              className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
            >
              {isListening ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <div className="backdrop-blur-md bg-white bg-opacity-50 p-2 rounded-md text-sm max-h-20 overflow-y-auto mb-2">
            {interimTranscript && (
              <div className="italic text-gray-600">
                {interimTranscript}
              </div>
            )}
            {responses.length > 0 && (
              <div className="text-gray-800">
                {responses[responses.length - 1].content}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
              placeholder="Type a message..."
              ref={input}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <button
              disabled={loading || message}
              onClick={sendMessage}
              className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
                loading || message ? "cursor-not-allowed opacity-30" : ""
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
