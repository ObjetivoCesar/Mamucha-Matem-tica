import { useState, useCallback } from 'react';
import { fileToGenerativePart } from '../utils/audio';
import { TranscriptEntry } from '../types';

export const useGeminiChat = (systemInstruction: string) => {
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (prompt: string, file: File | null) => {
    setIsLoading(true);

    const history = [...transcripts];
    const newUserEntry: TranscriptEntry = { speaker: 'user', text: prompt };
    
    let imagePart = null;
    if (file) {
      newUserEntry.imageUrl = URL.createObjectURL(file);
      const base64Image = await fileToGenerativePart(file);
      imagePart = base64Image.inlineData;
    }

    const updatedTranscripts = [...transcripts, newUserEntry, { speaker: 'model', text: '', isPending: true }];
    setTranscripts(updatedTranscripts);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history,
          prompt,
          image: imagePart,
          systemInstruction
        }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let modelResponseText = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value);
        modelResponseText += chunk;
        setTranscripts(prev => {
          const newTranscript = [...prev];
          const lastEntry = newTranscript[newTranscript.length - 1];
          if (lastEntry && lastEntry.isPending) {
            lastEntry.text = modelResponseText;
          }
          return newTranscript;
        });
      }
      
      setTranscripts(prev => {
        const newTranscript = [...prev];
        const lastEntry = newTranscript[newTranscript.length - 1];
        if (lastEntry && lastEntry.isPending) {
          lastEntry.isPending = false;
        }
        return newTranscript;
      });

    } catch (error) {
      console.error("Error sending message:", error);
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
  }, [transcripts, systemInstruction]);

  return {
    transcripts,
    isLoading,
    sendMessage,
  };
};