


'use client';

import { useState, useReducer, useRef, useLayoutEffect, useEffect } from 'react';
import conversationReducer from './conversationReducer';
import logo from '../../../assests/logo.svg';
import micIcon from '/mic.svg';
import micOffIcon from '/mic-off.svg';
import './VoiceBot.css'; // Keep your original CSS for now

const initialConversation = { messages: [], finalTranscripts: [], interimTranscript: '' };

function VoiceAssistant() {
  const [conversation, dispatch] = useReducer(conversationReducer, initialConversation);
  const [isRunning, setIsRunning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.5); // Default sensitivity (0-1)
  
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const audioElementRef = useRef(null);
  const audioDataRef = useRef([]);
  const messagesEndRef = useRef(null);
  const currentTranscript = conversation.interimTranscript;

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Open WebSocket connection
  function openWebSocketConnection() {
    const ws_url ='ws://localhost:8000/listen';
    wsRef.current = new WebSocket(ws_url);
    wsRef.current.binaryType = 'arraybuffer';
    wsRef.current.onopen = () => {
      console.log("WebSocket connection opened");  // Log connection
  };

    // Handle audio stream
    function handleAudioStream(streamData) {
      audioDataRef.current.push(new Uint8Array(streamData));
      if (sourceBufferRef.current && !sourceBufferRef.current.updating) {
        sourceBufferRef.current.appendBuffer(audioDataRef.current.shift());
      }
    }

    function handleJsonMessage(jsonData) {
      const message = JSON.parse(jsonData);
      if (message.type === 'finish') {
        endConversation();
      } else {
        if (message.type === 'transcript_final' && isAudioPlaying()) {
          skipCurrentAudio();
        }
        dispatch(message);
        
      }
    }

    wsRef.current.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        handleAudioStream(event.data);
      } else {
        handleJsonMessage(event.data);
      }
    };

    wsRef.current.onclose = () => {
      endConversation();
    };
  }

  // Close WebSocket connection
  function closeWebSocketConnection() {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }

  // Start microphone recording with sensitivity control
  async function startMicrophone() {
    try {
      if (mediaRecorderRef.current) {
        stopMicrophone();
      }
      
      // Convert sensitivity (0-1) to actual constraints
      // Lower sensitivity means higher volume is needed to pick up sound
      const volumeValue = 1 - sensitivity; // Invert: 0 = max sensitivity, 1 = min sensitivity
      
      // Apply audio constraints
      const audioConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          // Set gain to lower value for lower sensitivity
          // This is a simplified approach - actual browser support may vary
          channelCount: 1
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      
      // Create an AudioContext to process the stream
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      
      // Set gain based on sensitivity - lower gain = less sensitivity
      gainNode.gain.value = sensitivity;
      
      source.connect(gainNode);
      // Don't connect to destination to avoid feedback
      // gainNode.connect(audioContext.destination);
      
      // Create media recorder from the original stream
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
        audioContext.close();
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  // Stop microphone recording
  function stopMicrophone() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
  }

  // Start audio player
  function startAudioPlayer() {
    mediaSourceRef.current = getMediaSource();
    if (!mediaSourceRef.current) return;

    mediaSourceRef.current.addEventListener('sourceopen', () => {
      if (!MediaSource.isTypeSupported('audio/mpeg')) return;

      sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer('audio/mpeg');
      sourceBufferRef.current.addEventListener('updateend', () => {
        if (audioDataRef.current.length > 0 && !sourceBufferRef.current.updating) {
          sourceBufferRef.current.appendBuffer(audioDataRef.current.shift());
        }
      });
    });

    const audioUrl = URL.createObjectURL(mediaSourceRef.current);
    audioElementRef.current = new Audio(audioUrl);

    audioElementRef.current.addEventListener('canplay', () => {
      audioElementRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    });
  }

  // Check if audio is playing
  function isAudioPlaying() {
    return audioElementRef.current && audioElementRef.current.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA;
  }

  // Skip current audio
  function skipCurrentAudio() {
    audioDataRef.current = [];
    const buffered = sourceBufferRef.current.buffered;
    if (buffered.length > 0) {
      if (sourceBufferRef.current.updating) {
        sourceBufferRef.current.abort();
      }
      audioElementRef.current.currentTime = buffered.end(buffered.length - 1);
    }
  }

  // Stop audio player
  function stopAudioPlayer() {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      URL.revokeObjectURL(audioElementRef.current.src);
      audioElementRef.current = null;
    }

    if (mediaSourceRef.current) {
      if (sourceBufferRef.current) {
        mediaSourceRef.current.removeSourceBuffer(sourceBufferRef.current);
        sourceBufferRef.current = null;
      }
      mediaSourceRef.current = null;
    }

    audioDataRef.current = [];
  }

  // Start conversation
  async function startConversation() {
    dispatch({ type: 'reset' });
    try {
      openWebSocketConnection();
      await startMicrophone();
      startAudioPlayer();
      setIsRunning(true);
      setIsListening(true);
    } catch (err) {
      console.error('Error starting conversation:', err);
      endConversation();
    }
  }

  // End conversation
  function endConversation() {
    closeWebSocketConnection();
    stopMicrophone();
    stopAudioPlayer();
    setIsRunning(false);
    setIsListening(false);
  }

  // Toggle listening state
  function toggleListening() {
    if (!mediaRecorderRef.current) return;

    if (isListening) {
      mediaRecorderRef.current.pause();
    } else {
      mediaRecorderRef.current.resume();
      if (mediaRecorderRef.current.state === 'inactive') {
        startMicrophone();
      }
    }
    setIsListening(!isListening);
  }

  return (
    <div className='voice-bit-container'>
      <div className='voice-bot-header'>
        <a href='https://codeawake.com'>
          <img src={logo} width={128} alt='logo' />
        </a>
        <h1 className='voice-bot-title'>AI Voice Assistant</h1>
      </div>
      
      {/* Add simple sensitivity control */}
     
      
      <div className='conversation-controls'>
        <div className={`wave ${isRunning ? 'running' : ''}`} />
        <p className='instruction'>
          {isRunning
            ? 'You can also end the conversation by saying "bye" or "goodbye"'
            : 'Click here to start a voice conversation with the assistant'}
        </p>
        <div className='voice-bot-button-group'>
          <button className='voice-bot-start-button' onClick={isRunning ? endConversation : startConversation}>
            {isRunning ? 'End conversation' : 'Start conversation'}
          </button>
          <button className='mic-button' onClick={toggleListening} disabled={!isRunning}>
            <img src={isListening ? micIcon : micOffIcon} height={21} width={21} alt='microphone' />
          </button>
        </div>
      </div>
      <div className='message-container'>
        {conversation.messages.map(({ role, content }, idx) => (
          <div key={idx} className={role === 'user' ? 'user-bubble' : 'assistant-bubble'}>
            {content}
          </div>
        ))}
        {currentTranscript && <div className='user-bubble'>{currentTranscript}</div>}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

// Get MediaSource object
function getMediaSource() {
  if ('MediaSource' in window) return new MediaSource();
  console.log('No MediaSource API available');
  return null;
}

export default VoiceAssistant;
























































