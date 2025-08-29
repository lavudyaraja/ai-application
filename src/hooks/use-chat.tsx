import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Conversation, Message, ChatModel, Attachment } from '@/types/chat'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from './use-auth'
import { useProfile } from './use-profile'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import { getGeminiResponse } from '@/ai-services/gemini'
import { getOpenAiResponse } from '@/ai-services/openai'
import { getClaudeResponse } from '@/ai-services/claude'
import { getGrokResponse } from '@/ai-services/grok'

interface ChatContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  isTyping: boolean
  isLoadingHistory: boolean
  currentModel: ChatModel
  setModel: (model: ChatModel) => void
  createNewConversation: () => Promise<Conversation | null>
  selectConversation: (id: string) => void
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  exportAllData: () => Promise<void>
  deleteAllData: () => Promise<void>
  copyInfo: { open: boolean; text: string }
  openCopyFallback: (text: string) => void
  closeCopyFallback: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [currentModel, setCurrentModel] = useState<ChatModel>('gemini-1.5-flash');
  const [copyInfo, setCopyInfo] = useState<{ open: boolean; text: string }>({ open: false, text: '' });

  const currentConversation = conversations.find(c => c.id === currentConversationId) || null

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([])
      setCurrentConversationId(null)
      setIsLoadingHistory(false)
      return
    }
    setIsLoadingHistory(true)
    const { data, error } = await supabase
      .from('conversations')
      .select(`*, messages (*, user_id)`)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      toast.error('Failed to load chat history.')
      console.error(error)
    } else {
      const loadedConversations = data.map((conv: any) => ({
        ...conv,
        created_at: new Date(conv.created_at),
        updated_at: new Date(conv.updated_at),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          created_at: new Date(msg.created_at)
        })).sort((a: Message, b: Message) => a.created_at.getTime() - b.created_at.getTime())
      }))
      setConversations(loadedConversations)
      setCurrentConversationId(prevId => {
        if (prevId && loadedConversations.some(c => c.id === prevId)) {
          return prevId;
        }
        return loadedConversations.length > 0 ? loadedConversations[0].id : null;
      });
    }
    setIsLoadingHistory(false)
  }, [user])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const setModel = (model: ChatModel) => {
    setCurrentModel(model);
    const modelName = model.split('-')[0].toUpperCase();
    toast.info(`Switched to ${modelName}`);
  }

  const createNewConversation = useCallback(async (): Promise<Conversation | null> => {
    if (!user) {
      toast.error("You must be logged in to create a conversation.");
      return null;
    }

    const newConversationStub = {
      title: 'New Conversation',
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('conversations')
      .insert(newConversationStub)
      .select()
      .single();

    if (error) {
      toast.error('Failed to create new conversation.');
      return null;
    } else {
      const newConversation: Conversation = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        messages: [],
      };
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      return newConversation;
    }
  }, [user]);

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id)
  }, [])

  const deleteConversation = useCallback(async (id: string) => {
    const originalConversations = [...conversations]
    const newConversations = conversations.filter(c => c.id !== id)
    setConversations(newConversations)

    if (currentConversationId === id) {
      setCurrentConversationId(newConversations.length > 0 ? newConversations[0].id : null)
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete conversation.')
      setConversations(originalConversations)
    } else {
      toast.success('Conversation deleted.')
    }
  }, [conversations, currentConversationId])

  const getAiResponse = useCallback(async (messages: Message[], model: ChatModel): Promise<string> => {
    const userKeys = profile?.settings?.api_keys;

    switch (model) {
      case 'gemini-1.5-flash':
        const geminiKey = userKeys?.gemini || import.meta.env.VITE_GEMINI_API_KEY;
        if (!geminiKey) throw new Error("Gemini API key not found.");
        return getGeminiResponse(messages, geminiKey, model);
      
      case 'gpt-4o':
        if (!userKeys?.openai) throw new Error("OpenAI API key not found. Please add it in settings.");
        return getOpenAiResponse(messages, userKeys.openai, model);

      case 'claude-3-opus':
        if (!userKeys?.claude) throw new Error("Anthropic API key not found. Please add it in settings.");
        return getClaudeResponse(messages, userKeys.claude, model);
      
      case 'grok-1':
        return getGrokResponse();

      default:
        throw new Error(`Model ${model} is not supported.`);
    }
  }, [profile]);

  const sendMessage = useCallback(async (content: string, attachments: Attachment[] = []) => {
    if (!user) {
      toast.error("You must be logged in to send a message.");
      return;
    }

    let activeConversation = currentConversation;

    if (!activeConversation) {
      const newConversation = await createNewConversation();
      if (!newConversation) {
        toast.error("Could not start a new conversation. Please try again.");
        return;
      }
      activeConversation = newConversation;
    }
    
    const convId = activeConversation.id;
    const isFirstMessage = activeConversation.messages.length === 0;

    const userMessage: Omit<Message, 'id' | 'created_at'> & { created_at: string } = {
      role: 'user', content, attachments, created_at: new Date().toISOString(), conversation_id: convId, user_id: user.id
    };
    
    const tempUserMessage: Message = { ...userMessage, id: crypto.randomUUID(), created_at: new Date(userMessage.created_at) };

    // Optimistically update UI
    setConversations(prev => prev.map(conv => {
      if (conv.id !== convId) return conv;
      const newTitle = isFirstMessage && content ? content.slice(0, 50) : conv.title;
      return { ...conv, title: newTitle, messages: [...conv.messages, tempUserMessage], updated_at: new Date() };
    }));

    setIsTyping(true);

    try {
      // Save user message to DB
      if (isFirstMessage && content) {
        await supabase.from('conversations').update({ title: content.slice(0, 50) }).eq('id', convId);
      }
      await supabase.from('messages').insert([userMessage]);

      const responseContent = await getAiResponse([...activeConversation.messages, tempUserMessage], currentModel);

      const assistantMessageData: Omit<Message, 'id' | 'created_at'> & { created_at: string } = {
        role: 'assistant',
        content: responseContent,
        created_at: new Date().toISOString(),
        conversation_id: convId,
        user_id: user.id,
      };

      // Save assistant message to DB
      const { data: savedAssistantMessage, error } = await supabase
        .from('messages')
        .insert(assistantMessageData)
        .select()
        .single();
      
      if (error) throw error;
      
      const finalAssistantMessage: Message = {
        ...savedAssistantMessage,
        created_at: new Date(savedAssistantMessage.created_at),
      };

      // Update UI with final assistant message
      setConversations(prev => prev.map(conv => {
        if (conv.id !== convId) return conv;
        const finalMessages = [...conv.messages, finalAssistantMessage];
        return { ...conv, messages: finalMessages };
      }));

    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      console.error('Error sending message:', error);
      
      // Update the user's message with an error state instead of removing it
      setConversations(prev => prev.map(conv => {
        if (conv.id !== convId) return conv;
        return {
          ...conv,
          messages: conv.messages.map(msg => 
            msg.id === tempUserMessage.id ? { ...msg, error: errorMessage } : msg
          )
        };
      }));
    } finally {
      setIsTyping(false);
    }
  }, [user, currentConversation, createNewConversation, currentModel, getAiResponse]);

  const exportAllData = useCallback(async () => {
    if (!user) {
      toast.error("You must be logged in to export data.");
      return;
    }
    toast.info("Preparing your data for export...");
    const { data, error } = await supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('user_id', user.id);

    if (error || !data) {
      toast.error("Failed to fetch your data.");
      return;
    }

    const zip = new JSZip();
    data.forEach(conversation => {
      const conversationData = JSON.stringify(conversation, null, 2);
      zip.file(`conversation-${conversation.id}.json`, conversationData);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(content, `grok-export-all-${new Date().toISOString()}.zip`);
      toast.success("Your data has been exported.");
    });
  }, [user]);

  const deleteAllData = useCallback(async () => {
    if (!user) {
      toast.error("You must be logged in to delete data.");
      return;
    }
    
    const { data: convIds, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)

    if (convError || !convIds) {
      toast.error("Could not fetch conversations to delete.");
      return;
    }

    const ids = convIds.map(c => c.id);
    if (ids.length === 0) {
      toast.info("No data to delete.");
      return;
    }

    const { error: deleteError } = await supabase.from('conversations').delete().in('id', ids);

    if (deleteError) {
      toast.error("Failed to delete your data. Please try again.");
    } else {
      setConversations([]);
      setCurrentConversationId(null);
      toast.success("All your conversation data has been deleted.");
    }
  }, [user]);

  const openCopyFallback = (text: string) => {
    setCopyInfo({ open: true, text });
  };

  const closeCopyFallback = () => {
    setCopyInfo({ open: false, text: '' });
  };

  return (
    <ChatContext.Provider value={{
      conversations, currentConversation, isTyping, isLoadingHistory, currentModel, setModel,
      createNewConversation, selectConversation, sendMessage, deleteConversation, exportAllData, deleteAllData,
      copyInfo, openCopyFallback, closeCopyFallback
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
