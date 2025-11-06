import { Part, InlineData } from '@google/genai';

// Converts a File object to a GoogleGenerativeAI.Part object.
export async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (err) => {
        reject(err);
    }
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type
    },
  };
}
