import { GoogleGenAI, Chat, Part, InlineData } from '@google/genai';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Define el tipo para la entrada de historial del cliente
interface ClientTranscriptEntry {
  speaker: 'user' | 'model';
  text: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { history, prompt, image, systemInstruction } = req.body as {
        history: ClientTranscriptEntry[],
        prompt: string,
        image: InlineData | null,
        systemInstruction: string,
    };

    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Mapea el historial del cliente al formato que espera la API
    const historyForApi = history.map(entry => ({
      role: entry.speaker,
      parts: [{ text: entry.text }], // Simplificamos, el historial no re-envía imágenes
    }));

    const chat: Chat = ai.chats.create({
      model: 'gemini-flash-latest',
      config: {
        systemInstruction: systemInstruction,
      },
      history: historyForApi,
    });

    const userParts: Part[] = [];
    if (image) {
      userParts.push({ inlineData: image });
    }
    if (prompt) {
      userParts.push({ text: prompt });
    }

    const stream = await chat.sendMessageStream({ parts: userParts });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of stream) {
      res.write(chunk.text);
    }

    res.end();

  } catch (error) {
    console.error('Error in chat handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
