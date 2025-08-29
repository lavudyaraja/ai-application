import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FlaskConical, Youtube, Globe, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { analyzeSources } from '@/ai-services/researchAssistant'
import { useProfile } from '@/hooks/use-profile'

// Types for the output data
interface SourceIdentifier {
  type: 'youtube' | 'web';
  id?: string;
  link?: string;
  title: string;
}

interface Claim {
  id: string;
  claim_text: string;
  supporting: SourceIdentifier[];
  contradicting: SourceIdentifier[];
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
}

interface Citation {
  type: 'youtube' | 'web';
  id?: string;
  title: string;
  url: string;
  publisher: string;
  publishedAt: string | null;
  accessed: string;
}

interface ResearchResult {
  topic: string;
  claims: Claim[];
  summary: string;
  citations: Citation[];
}

const placeholderJson = `{
  "topic": "The impact of AI on the job market",
  "youtube": [
    {"id": "abc123", "title": "AI Will Take Your Job?", "description": "...", "channelTitle": "TechTomorrow", "publishedAt": "2024-06-15"},
    {"id": "def456", "title": "AI: The Ultimate Job Creator", "description": "...", "channelTitle": "FutureProof", "publishedAt": "2024-05-20"}
  ],
  "web": [
    {"title": "Study: AI to displace 85 million jobs...", "link": "https://example.com/...", "snippet": "...", "source": "weforum.org"}
  ]
}`;

export function ResearchAssistantPage() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [jsonInput, setJsonInput] = useState('')
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please paste your JSON input to analyze.');
      return;
    }
    
    let parsedInput;
    try {
      parsedInput = JSON.parse(jsonInput);
    } catch (e) {
      toast.error('Invalid JSON format. Please check your input.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const geminiKey = profile?.settings?.api_keys?.gemini || import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error('Gemini API key is not configured. Please add it in Settings > Developer Keys.');
      }
      const extractedData = await analyzeSources(parsedInput, geminiKey);
      setResult(extractedData);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
      toast.error(e.message || 'Failed to analyze sources.');
    } finally {
      setIsLoading(false);
    }
  };

  const confidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return 'bg-green-500/20 text-green-700 border-green-300 dark:text-green-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300 dark:text-yellow-300';
      case 'low': return 'bg-red-500/20 text-red-700 border-red-300 dark:text-red-300';
    }
  };

  const SourceLink = ({ source }: { source: SourceIdentifier }) => (
    <a
      href={source.type === 'youtube' ? `https://youtube.com/watch?v=${source.id}` : source.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
    >
      {source.type === 'youtube' ? <Youtube className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
      <span className="truncate">{source.title}</span>
    </a>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <FlaskConical className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Research Assistant</h1>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Sources</CardTitle>
              <CardDescription>Paste your sources as a JSON object to analyze and extract factual claims.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-input">Sources JSON</Label>
                <Textarea
                  id="json-input"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`Paste your JSON here. For example:\n\n${placeholderJson}`}
                  className="min-h-[250px] font-mono text-xs"
                />
              </div>
              <Button onClick={handleAnalyze} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Analyzing...' : 'Analyze Sources'}
              </Button>
            </CardContent>
          </Card>

          {isLoading && <Skeleton className="h-96 w-full" />}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-8 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis for: {result.topic}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{result.summary}</p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Top 5 Factual Claims</h3>
                {result.claims.map(claim => (
                  <Card key={claim.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <p className="font-medium">{claim.claim_text}</p>
                        <Badge variant="outline" className={confidenceColor(claim.confidence)}>{claim.confidence}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground italic">Rationale: {claim.rationale}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" /> Supporting Sources
                          </h4>
                          <div className="mt-2 space-y-1">
                            {claim.supporting.length > 0 ? claim.supporting.map((s, i) => <SourceLink key={i} source={s} />) : <p className="text-xs text-muted-foreground">None</p>}
                          </div>
                        </div>
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                            <XCircle className="h-4 w-4" /> Contradicting Sources
                          </h4>
                          <div className="mt-2 space-y-1">
                            {claim.contradicting.length > 0 ? claim.contradicting.map((s, i) => <SourceLink key={i} source={s} />) : <p className="text-xs text-muted-foreground">None</p>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Citations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    {result.citations.map((cite, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-muted-foreground">{i + 1}.</span>
                        <div>
                          <p>{cite.publisher}. ({cite.publishedAt || 'n.d.'}). <em>{cite.title}</em>. Retrieved {cite.accessed}, from <a href={cite.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{cite.url}</a></p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
