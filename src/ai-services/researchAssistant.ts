import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are a multi-source research assistant.
Task:
1. Analyze the provided sources (YouTube videos + web articles).
2. Extract the top 5 factual claims about the topic.
3. For each claim, identify which sources support it and which contradict it. Do not list sources that don't mention it.
4. Assign a confidence score (high/medium/low) and provide a one-sentence rationale.
5. Provide a short comparison summary (2-3 sentences) highlighting similarities/differences between YouTube and web sources.
6. Return proper citations with publisher, title, link, publish date (if available), and today's accessed date.

Return your entire response as a SINGLE, VALID JSON object. Do not include any text, markdown, or explanations outside of the JSON object.

The output JSON must strictly follow this format:
{
  "topic": "...",
  "claims": [
    {
      "id": "c1",
      "claim_text": "...",
      "supporting": [
        {"type":"youtube","id":"...","title":"..."},
        {"type":"web","link":"...","title":"..."}
      ],
      "contradicting": [],
      "confidence": "high",
      "rationale": "..."
    }
  ],
  "summary": "...",
  "citations": [
    {
      "type": "youtube",
      "id": "...",
      "title": "...",
      "url": "https://youtube.com/watch?v=...",
      "publisher": "ChannelName",
      "publishedAt": "YYYY-MM-DD",
      "accessed": "YYYY-MM-DD"
    },
    {
      "type": "web",
      "title": "...",
      "url": "https://...",
      "publisher": "...",
      "publishedAt": "YYYY-MM-DD",
      "accessed": "YYYY-MM-DD"
    }
  ]
}

Today's date is: [CURRENT_DATE]

Analyze the following JSON input:
`;

export async function analyzeSources(
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
    console.error("Research Assistant API Error:", error);
    if (error instanceof SyntaxError) {
      throw new Error("The AI returned an invalid format. Please try again.");
    }
    throw new Error("Failed to get response from the AI model.");
  }
}
