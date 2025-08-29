import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, Quote, Link as LinkIcon, Youtube } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { formatCitations } from '@/ai-services/citationFormatter'
import { useProfile } from '@/hooks/use-profile'

interface Citation {
  type: 'youtube' | 'web';
  id?: string;
  title: string;
  url: string;
  publisher: string;
  publishedAt: string | null;
  accessed: string;
}

const placeholderJson = `{
  "youtube": [
    {"id": "abc123", "title": "AI Will Take Your Job?", "channelTitle": "TechTomorrow", "publishedAt": "2024-06-15"}
  ],
  "web": [
    {"title": "Study: AI to displace 85 million jobs...", "link": "https://example.com/...", "source": "weforum.org"}
  ]
}`;

export function CitationFormatterPage() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [jsonInput, setJsonInput] = useState('')
  const [result, setResult] = useState<Citation[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFormat = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please paste your JSON input to format.');
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
      const formattedData = await formatCitations(parsedInput, geminiKey);
      setResult(formattedData);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
      toast.error(e.message || 'Failed to format citations.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Quote className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Citation Formatter</h1>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Format Sources</CardTitle>
              <CardDescription>Paste your sources as a JSON object to convert them into standardized citations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-input">Sources JSON</Label>
                <Textarea
                  id="json-input"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`Paste your sources JSON here. For example:\n\n${placeholderJson}`}
                  className="min-h-[200px] font-mono text-xs"
                />
              </div>
              <Button onClick={handleFormat} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Formatting...' : 'Format Citations'}
              </Button>
            </CardContent>
          </Card>

          {isLoading && <Skeleton className="h-64 w-full" />}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Formatting Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Formatted Citations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.map((citation, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50 flex items-start gap-4">
                    {citation.type === 'youtube' ? <Youtube className="h-5 w-5 text-red-500 mt-1" /> : <LinkIcon className="h-5 w-5 text-blue-500 mt-1" />}
                    <div className="text-sm">
                      <p className="font-semibold">{citation.title}</p>
                      <p className="text-muted-foreground">Publisher: {citation.publisher}</p>
                      <p className="text-muted-foreground">Published: {citation.publishedAt || 'N/A'}</p>
                      <p className="text-muted-foreground">Accessed: {citation.accessed}</p>
                      <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs break-all">{citation.url}</a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
