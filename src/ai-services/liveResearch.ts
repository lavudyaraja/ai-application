import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// import { YoutubeVideo, WebArticle } from "@/types/chat";

// Switched to a more reliable CORS proxy
const CORS_PROXY = 'https://corsproxy.io/?';

// Live implementation for YouTube search
export async function searchYoutube(topic: string) {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey || apiKey.includes('YOUR_API_KEY') || apiKey === 'API_KEY_ADDED') {
    console.warn("YouTube API key not found. Using mock data.");
    return [
      { id: 'mock1', title: `Mock Result: A Deep Dive into ${topic}`, channel: 'Knowledge Hub', thumbnail: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/120x90/e2e8f0/e2e8f0.png', url: '#' },
    ];
  }

  const targetUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&type=video&maxResults=5&key=${apiKey}`;
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Proxy or API error: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Received non-JSON response from the proxy. The proxy may be down.');
    }

    const result = await response.json();
    
    if (result.error) {
       throw new Error(`YouTube API Error: ${result.error.message}`);
    }
    
    if (!result.items) return [];

    return result.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.default.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (error) {
    console.error("Failed to fetch from YouTube API:", error);
    if (error instanceof SyntaxError) {
      throw new Error("The CORS proxy returned an invalid response (HTML instead of JSON). The proxy service may be temporarily unavailable.");
    }
    throw new Error("Failed to fetch YouTube videos. Please check your API key and quota.");
  }
}

// Live implementation for Web search using SerpApi
export async function searchWeb(topic: string) {
  const apiKey = import.meta.env.VITE_SERPAPI_KEY;

  if (!apiKey || apiKey.includes('YOUR_API_KEY') || apiKey === 'API_KEY_ADDED') {
    console.warn("SerpApi key not found. Using mock data.");
    return [
      { title: `Mock Result: The Ultimate Guide to ${topic}`, url: '#', snippet: `An in-depth look at the core principles and future trends of ${topic}.`, source: 'techcrunch.com' },
    ];
  }

  const targetUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(topic)}&api_key=${apiKey}&engine=google`;
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
  
  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Proxy or API error: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Received non-JSON response from the proxy. The proxy may be down.');
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`SerpApi Error: ${result.error}`);
    }
    
    if (!result.organic_results) return [];

    return result.organic_results.slice(0, 5).map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      source: item.source || new URL(item.link).hostname
    }));
  } catch (error) {
    console.error("Failed to fetch from SerpApi:", error);
    if (error instanceof SyntaxError) {
      throw new Error("The CORS proxy returned an invalid response (HTML instead of JSON). The proxy service may be temporarily unavailable.");
    }
    throw new Error("Failed to fetch web sources from SerpApi. Please check your API key.");
  }
}


// Function to generate summary using Gemini
export async function generateTopicSummary(
  topic: string,
  // sources: { videos: YoutubeVideo[], articles: WebArticle[] },
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  // const sourceInfo = `
  //   YouTube Video Titles:
  //   ${sources.videos.map(v => `- ${v.title}`).join('\n')}

  //   Web Article Titles and Snippets:
  //   ${sources.articles.map(a => `- ${a.title}: ${a.snippet}`).join('\n')}
  // `;

  const prompt = `You are a research assistant. Based on the following topic and source materials, provide a concise, well-written summary (2-3 paragraphs) of the topic.

Topic: ${topic}

Source Materials (titles and snippets):


Your Summary:
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Summary Generation API Error:", error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error("A network error occurred while contacting the Gemini API. This is likely a CORS issue in your browser environment.");
    }
    throw new Error("Failed to generate summary from the AI model.");
  }
}
