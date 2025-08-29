import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useChat } from "@/hooks/use-chat"
import { useProfile } from "@/hooks/use-profile"
import { ChatModel } from "@/types/chat"
import { Bot, Sparkles, BrainCircuit, CheckCircle2, AlertCircle } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

const models: { id: ChatModel; name: string; icon: React.ElementType, keyName: 'gemini' | 'openai' | 'claude' | 'grok' }[] = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5", icon: Sparkles, keyName: 'gemini' },
  { id: "gpt-4o", name: "GPT-4o", icon: Bot, keyName: 'openai' },
  { id: "claude-3-opus", name: "Claude 3", icon: BrainCircuit, keyName: 'claude' },
  { id: "grok-1", name: "Grok", icon: Bot, keyName: 'grok' },
]

export function ModelSelector() {
  const { currentModel, setModel } = useChat()
  const { profile } = useProfile()

  const isModelConfigured = (keyName: 'gemini' | 'openai' | 'claude' | 'grok') => {
    if (keyName === 'gemini' && import.meta.env.VITE_GEMINI_API_KEY) return true;
    if (keyName === 'grok') return true; // Grok is a placeholder
    return !!profile?.settings?.api_keys?.[keyName];
  }

  const SelectedIcon = models.find(m => m.id === currentModel)?.icon || Sparkles;

  return (
    <Select value={currentModel} onValueChange={(value) => setModel(value as ChatModel)}>
      <SelectTrigger className="w-auto h-8 px-2 gap-2 bg-transparent border-0 shadow-none hover:bg-accent focus:ring-0 focus:ring-offset-0">
        <SelectValue asChild>
          <div className="flex items-center gap-2">
            <SelectedIcon className="h-4 w-4" />
            <span className="text-xs font-medium hidden sm:inline">
              {models.find(m => m.id === currentModel)?.name}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {models.map((model) => {
          const Icon = model.icon;
          const isConfigured = isModelConfigured(model.keyName);
          return (
            <SelectItem key={model.id} value={model.id} disabled={!isConfigured}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4", !isConfigured && "opacity-50")} />
                  <span className={cn(!isConfigured && "opacity-50")}>{model.name}</span>
                </div>
                {isConfigured ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
