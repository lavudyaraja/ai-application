import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, Telescope, Youtube, Globe, Bot } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useProfile } from '@/hooks/use-profile'
import { searchYoutube, searchWeb, generateTopicSummary, YoutubeVideo, WebArticle } from '@/ai-services/liveResearch'

interface ResearchResult {
  summary: string;
  videos: YoutubeVideo[];
  articles: WebArticle[];
}

export function LiveResearchPage() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [topic, setTopic] = useState('')
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResearch = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic to research.')
      return
    }
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // These are placeholder functions.
      // You need to implement them with real APIs.
      const videos = await searchYoutube(topic)
      const articles = await searchWeb(topic)

      const geminiKey = profile?.settings?.api_keys?.gemini || import.meta.env.VITE_GEMINI_API_KEY
      if (!geminiKey) {
        throw new Error('Gemini API key is not configured. Please add it in Settings > Developer Keys.')
      }

      const summary = await generateTopicSummary(topic, { videos, articles }, geminiKey)
      
      setResult({ summary, videos, articles })

    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.')
      toast.error(e.message || 'Failed to perform research.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Telescope className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Live Research Assistant</h1>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Research a Topic</CardTitle>
              <CardDescription>Enter a topic to fetch YouTube videos, web articles, and an AI-generated summary.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The future of renewable energy"
                className="flex-grow"
                onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
              />
              <Button onClick={handleResearch} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Researching...' : 'Start Research'}
              </Button>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-2">
                <Card><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
              </div>
              <div><Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></CardContent></Card></div>
              <div><Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></CardContent></Card></div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Research Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-8 animate-fade-in">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" /> AI Summary for "{topic}"
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90 leading-relaxed">{result.summary}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Youtube className="h-5 w-5 text-red-500" /> YouTube Videos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.videos.map(video => (
                      <a key={video.id} href={video.url} target="_blank" rel="noopener noreferrer" className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <img src={video.thumbnail} alt={video.title} className="w-24 h-14 object-cover rounded-md bg-muted" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm line-clamp-2">{video.title}</p>
                            <p className="text-xs text-muted-foreground">{video.channel}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-500" /> Web Articles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.articles.map((article, index) => (
                      <a key={index} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <p className="font-semibold text-sm">{article.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.snippet}</p>
                        <p className="text-xs text-primary mt-2 truncate">{article.source}</p>
                      </a>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
