import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from "@google/generative-ai";
import { Message } from '@/types/chat';

function fileToGenerativePart(base64: string, mimeType: string): Part {
  return {
    inlineData: {
      data: base64.split(',')[1],
      mimeType
    },
  };
}

export async function getGeminiResponse(
  messages: Message[],
  apiKey: string,
  model: string = 'gemini-1.5-flash'
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ 
    model,
    systemInstruction: "You are a helpful AI assistant. When you respond, you may optionally start your response with a single word in parentheses to indicate your tone, like (happy), (thoughtful), or (excited). For example: (happy) I'd be glad to help with that!",
    generationConfig: {
        maxOutputTokens: 2048,
    },
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  const rawHistory = messages.slice(0, -1);
  // The Gemini API requires the history to start with a 'user' role.
  // We find the first user message and discard any preceding assistant messages.
  const firstUserIndex = rawHistory.findIndex(msg => msg.role === 'user');
  const validRawHistory = firstUserIndex === -1 ? [] : rawHistory.slice(firstUserIndex);

  const history = validRawHistory.map(msg => {
    const parts: Part[] = [{ text: msg.content }];
    if (msg.attachments) {
      msg.attachments.forEach(att => {
        if (att.type === 'image') {
          const mimeType = att.url.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
          parts.push(fileToGenerativePart(att.url, mimeType));
        }
      });
    }
    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  const lastMessage = messages[messages.length - 1];
  const promptParts: Part[] = [{ text: lastMessage.content }];
  if (lastMessage.attachments) {
    lastMessage.attachments.forEach(att => {
      if (att.type === 'image') {
        const mimeType = att.url.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
        promptParts.push(fileToGenerativePart(att.url, mimeType));
      }
    });
  }

  try {
    const chat = geminiModel.startChat({ history });
    const result = await chat.sendMessage(promptParts);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error("A network error occurred while contacting the Gemini API. This is likely a temporary issue or a browser security (CORS) restriction.");
    }
    if (error.message && error.message.includes("API_KEY_INVALID")) {
        throw new Error("Your Gemini API key is invalid. Please add a valid key in Settings > Developer Keys.");
    }
    throw new Error("Failed to get response from Gemini. Check your API key and configuration.");
  }
}
