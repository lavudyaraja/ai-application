import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are a meticulous citation formatter.
Task: Take the following list of sources and convert them into a standardized array of citation objects.

Rules:
- The output must be a single, valid JSON array. Do not include any text or markdown outside of the array.
- For each source, create an object with the following keys: "type", "title", "url", "publisher", "publishedAt", and "accessed".
- The "type" should be "youtube" or "web".
- For YouTube sources, you must also include the "id" field.
- The "url" for YouTube sources must be constructed as \`https://youtube.com/watch?v={id}\`.
- The "publisher" should be the domain name for web sources and the channel title for YouTube sources.
- The "publishedAt" field should be in "YYYY-MM-DD" format if available, otherwise null.
- The "accessed" date MUST be today's date.

Today's date is: [CURRENT_DATE]

Format the following sources:
`;

export async function formatCitations(
  sources: object,
  apiKey: string
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  const today = new Date().toISOString().split('T')[0];
  const prompt = SYSTEM_PROMPT.replace('[CURRENT_DATE]', today) + `\n${JSON.stringify(sources, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();
    return JSON.parse(responseText);
  } catch (error: any) {
    console.error("Citation Formatting API Error:", error);
    if (error instanceof SyntaxError) {
      throw new Error("The AI returned an invalid format. Please try again.");
    }
    throw new Error("Failed to get response from the AI model.");
  }
}
