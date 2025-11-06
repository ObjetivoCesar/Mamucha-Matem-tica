import { useState, useCallback } from 'react';
import { GoogleGenAI, Part } from '@google/genai';
import { fileToGenerativePart } from '../utils/audio';
import { TranscriptEntry } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const useGeminiChat = (systemInstruction: string) => {
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (prompt: string, file: File | null) => {
    setIsLoading(true);

    const userParts: Part[] = [];
    let imageUrl: string | undefined = undefined;
    
    // Add user message to transcript immediately for better UX
    if (file) {
      imageUrl = URL.createObjectURL(file);
    }
    setTranscripts(prev => [...prev, { speaker: 'user', text: prompt, imageUrl }]);
    setTranscripts(prev => [...prev, { speaker: 'model', text: '', isPending: true }]);


    try {
      if (file) {
        const imagePart = await fileToGenerativePart(file);
        userParts.push(imagePart);
      }
      if (prompt) {
        userParts.push({ text: prompt });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: { parts: userParts },
        config: {
          systemInstruction: systemInstruction,
        },
      });

      const modelResponseText = response.text;
      
      // Update the pending message with the actual response
      setTranscripts(prev => {
        const newTranscript = [...prev];
        const lastEntry = newTranscript[newTranscript.length - 1];
        if(lastEntry && lastEntry.isPending) {
            lastEntry.text = modelResponseText;
            lastEntry.isPending = false;
        }
        return newTranscript;
      });

    } catch (error) {
      console.error("Error sending message:", error);
      // Update the pending message with an error
       setTranscripts(prev => {
        const newTranscript = [...prev];
        const lastEntry = newTranscript[newTranscript.length - 1];
        if(lastEntry && lastEntry.isPending) {
            lastEntry.text = "Lo siento, mijo/mija. Hubo un error al procesar tu pregunta. Inténtalo de nuevo.";
            lastEntry.isPending = false;
        }
        return newTranscript;
      });
    } finally {
      setIsLoading(false);
    }
  }, [systemInstruction]);

  return {
    transcripts,
    isLoading,
    sendMessage,
  };
};