import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, BrainCircuit, Lightbulb, Network, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { extractKnowledgeGraph } from '@/ai-services/knowledgeExtractor'
import { useProfile } from '@/hooks/use-profile'

interface Concept {
  id: string
  name: string
  description: string
}

interface Relationship {
  source: string
  target: string
  label: string
}

interface KnowledgeGraph {
  concepts: Concept[]
  relationships: Relationship[]
}

export function KnowledgeExtractorPage() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [text, setText] = useState('Neural networks are inspired by the human brain and are used in deep learning. Deep learning itself is a subfield of machine learning.')
  const [domain, setDomain] = useState('Computer Science')
  const [level, setLevel] = useState('Intermediate')
  const [result, setResult] = useState<KnowledgeGraph | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExtract = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze.')
      return
    }
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const geminiKey = profile?.settings?.api_keys?.gemini || import.meta.env.VITE_GEMINI_API_KEY
      if (!geminiKey) {
        throw new Error('Gemini API key is not configured. Please add it in Settings > Developer Keys.')
      }
      const extractedData = await extractKnowledgeGraph(text, domain, level, geminiKey)
      setResult(extractedData)
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.')
      toast.error(e.message || 'Failed to extract knowledge graph.')
    } finally {
      setIsLoading(false)
    }
  }

  const getConceptName = (id: string) => {
    return result?.concepts.find(c => c.id === id)?.name || id
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Knowledge Extractor</h1>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-input">Text to Analyze</Label>
                <Textarea
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or type your text here..."
                  className="min-h-[150px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domain-select">Domain (Optional)</Label>
                  <Select value={domain} onValueChange={setDomain}>
                    <SelectTrigger id="domain-select">
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level-select">User Level (Optional)</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger id="level-select">
                      <SelectValue placeholder="Select a level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleExtract} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Analyzing...' : 'Extract Concepts'}
              </Button>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="space-y-6">
              <Card>
                <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                <CardContent><Skeleton className="h-10 w-full" /></CardContent>
              </Card>
              <Card>
                <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Extraction Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Detected Concepts
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {result.concepts.map(concept => (
                    <div key={concept.id} className="p-4 border rounded-lg bg-card basis-full md:basis-[calc(50%-0.5rem)]">
                      <p className="font-semibold">{concept.name}</p>
                      <p className="text-sm text-muted-foreground">{concept.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Relationships
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.relationships.map((rel, index) => (
                    <div key={index} className="flex items-center justify-center gap-2 p-3 border rounded-lg bg-muted/50 text-center text-sm">
                      <span className="font-medium bg-background p-2 rounded-md">{getConceptName(rel.source)}</span>
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground italic">{rel.label.replace(/_/g, ' ')}</span>
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium bg-background p-2 rounded-md">{getConceptName(rel.target)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
