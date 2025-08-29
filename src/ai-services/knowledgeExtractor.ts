import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are an expert in knowledge engineering and semantic analysis. Your task is to analyze the provided text and extract key concepts and the semantic relationships between them.

Context:
- Domain: [DOMAIN]
- Target Audience Level: [LEVEL]

Instructions:
1.  Identify the main concepts, entities, and ideas in the text.
2.  Determine the relationships between these concepts. Use relationship types like "is_a", "part_of", "example_of", "inspired_by", "used_in", "property_of", "causes", "antonym_of", "depends_on".
3.  Structure your output as a SINGLE, VALID JSON object. Do not include any text, markdown, or explanations outside of the JSON object.
4.  The JSON object must have two main keys: "concepts" and "relationships".
5.  The "concepts" array should contain objects, each with an "id" (a unique, kebab-case string based on the name), a "name" (the concept itself), and a brief "description" derived from the text.
6.  The "relationships" array should contain objects, each with a "source" (the id of the source concept), a "target" (the id of the target concept), and a "label" (the relationship type, e.g., "inspired_by").

Example Input Text: "Neural networks are inspired by the human brain and are used in deep learning."
Example JSON Output:
{
  "concepts": [
    { "id": "neural-networks", "name": "Neural Networks", "description": "Computational models inspired by the biological neural networks that constitute animal brains." },
    { "id": "human-brain", "name": "Human Brain", "description": "The central organ of the human nervous system." },
    { "id": "deep-learning", "name": "Deep Learning", "description": "A subfield of machine learning based on artificial neural networks." }
  ],
  "relationships": [
    { "source": "neural-networks", "target": "human-brain", "label": "inspired_by" },
    { "source": "neural-networks", "target": "deep-learning", "label": "used_in" }
  ]
}
`;

export async function extractKnowledgeGraph(
  text: string,
  domain: string,
  level: string,
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

  const prompt = SYSTEM_PROMPT.replace('[DOMAIN]', domain).replace('[LEVEL]', level) + `\n\nAnalyze the following text:\n\n${text}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();
    
    // The Gemini API with JSON output mode should return a clean JSON string.
    // We parse it to ensure it's valid before returning.
    return JSON.parse(responseText);
  } catch (error: any) {
    console.error("Knowledge Extraction API Error:", error);
    if (error instanceof SyntaxError) {
      throw new Error("The AI returned an invalid format. Please try again.");
    }
    throw new Error("Failed to get response from the AI model.");
  }
}
