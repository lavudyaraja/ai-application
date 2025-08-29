import Anthropic from '@anthropic-ai/sdk';
import { Message } from '@/types/chat';

export async function getClaudeResponse(
  messages: Message[],
  apiKey: string,
  model: string = 'claude-3-opus-20240229'
): Promise<string> {
  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = "You are a helpful AI assistant. When you respond, you may optionally start your response with a single word in parentheses to indicate your tone, like (happy), (thoughtful), or (excited). For example: (happy) I'd be glad to help with that!";
  const history = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
  
  // The last message is the current user prompt
  const userPrompt = history.pop();
  if (!userPrompt || userPrompt.role !== 'user') {
    throw new Error("Invalid prompt sequence for Claude API.");
  }

  try {
    const msg = await anthropic.messages.create({
      model: model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        ...history,
        { role: 'user', content: userPrompt.content }
      ],
    });
    
    return msg.content
      .filter((c): c is Anthropic.TextBlock => c.type === 'text')
      .map(c => c.text)
      .join('');

  } catch (error) {
    console.error("Claude API Error:", error);
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API Error: ${error.status} ${error.message}`);
    }
    throw new Error("Failed to get response from Claude.");
  }
}
