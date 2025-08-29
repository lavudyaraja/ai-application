import OpenAI from 'openai';
import { Message } from '@/types/chat';

export async function getOpenAiResponse(
  messages: Message[],
  apiKey: string,
  model: string = 'gpt-4o'
): Promise<string> {
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const history = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are a helpful AI assistant. When you respond, you may optionally start your response with a single word in parentheses to indicate your tone, like (happy), (thoughtful), or (excited). For example: (happy) I'd be glad to help with that!" },
        ...history,
      ],
    });

    return completion.choices[0]?.message?.content || "No response from OpenAI.";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.status} ${error.message}`);
    }
    throw new Error("Failed to get response from OpenAI.");
  }
}
