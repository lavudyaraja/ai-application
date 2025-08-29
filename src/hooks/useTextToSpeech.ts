import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface SpeechSynthesisHook {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string, lang: string) => void;
  stop: () => void;
}

export const useTextToSpeech = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) return;

    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    handleVoicesChanged(); // Initial fetch

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      window.speechSynthesis.cancel(); // Cleanup on unmount
    };
  }, [isSupported]);

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if (!isSupported || isSpeaking) return;

    // Stop any previous speech
    window.speechSynthesis.cancel();

    let textToSpeak = text;
    let pitch = 1;
    let rate = 1;

    // Basic emotion parsing
    const emotionMatch = text.match(/^\(([^)]+)\)/);
    if (emotionMatch) {
      const emotion = emotionMatch[1].toLowerCase();
      textToSpeak = text.substring(emotionMatch[0].length).trim();
      
      switch (emotion) {
        case 'happy': case 'excited':
          pitch = 1.2; rate = 1.1;
          break;
        case 'sad': case 'thoughtful':
          pitch = 0.8; rate = 0.9;
          break;
        case 'curious':
          pitch = 1.1;
          break;
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Find a suitable voice
    const targetLang = lang.split('-')[0];
    const voice = voices.find(v => v.lang.startsWith(targetLang)) || voices.find(v => v.lang.startsWith('en'));
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = lang;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      toast.error(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported, isSpeaking, voices]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { isSpeaking, isSupported, speak, stop };
};
