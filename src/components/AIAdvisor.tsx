import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAdvisorProps {
  userContext?: {
    country?: string;
    accountType?: string;
    expenses?: number;
    income?: number;
  };
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ userContext }) => {
  const { language, t } = useLanguage();
  
  const getGreeting = () => {
    const greetings = {
      en: 'Hello! I\'m your AI Financial Advisor. I can help you with tax optimization, expense management, financial planning, and business strategies. How can I assist you today?',
      sk: 'Ahoj! Som váš AI finančný poradca. Môžem vám pomôcť s daňovou optimalizáciou, správou výdavkov, finančným plánovaním a obchodnými stratégiami. Ako vám môžem pomôcť?',
      de: 'Hallo! Ich bin Ihr KI-Finanzberater. Ich kann Ihnen bei Steueroptimierung, Ausgabenverwaltung, Finanzplanung und Geschäftsstrategien helfen. Wie kann ich Ihnen heute helfen?',
      fr: 'Bonjour! Je suis votre conseiller financier IA. Je peux vous aider avec l\'optimisation fiscale, la gestion des dépenses, la planification financière et les stratégies commerciales. Comment puis-je vous aider aujourd\'hui?'
    };
    return greetings[language as keyof typeof greetings] || greetings.en;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getGreeting()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-advisor`;
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          message: userMessage,
          context: userContext,
          language: language
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({
            title: "Rate Limit",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
          return;
        }
        if (resp.status === 402) {
          toast({
            title: "Usage Limit",
            description: "AI usage limit reached. Please contact support.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to get AI response");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error streaming chat:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      // Remove the empty assistant message
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      await streamChat(userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSuggestedQuestions = () => {
    const suggestions = {
      en: [
        "How can I optimize my corporate taxes?",
        "What expenses are tax-deductible?",
        "Help me plan my business finances",
        "Compare tax rates across countries"
      ],
      sk: [
        "Ako môžem optimalizovať svoje firemné dane?",
        "Ktoré výdavky sú daňovo odpočítateľné?",
        "Pomôžte mi naplánovať moje obchodné financie",
        "Porovnajte daňové sadzby v rôznych krajinách"
      ],
      de: [
        "Wie kann ich meine Unternehmenssteuern optimieren?",
        "Welche Ausgaben sind steuerlich absetzbar?",
        "Helfen Sie mir, meine Unternehmensfinanzen zu planen",
        "Vergleichen Sie Steuersätze in verschiedenen Ländern"
      ],
      fr: [
        "Comment puis-je optimiser mes impôts d'entreprise?",
        "Quelles dépenses sont déductibles d'impôts?",
        "Aidez-moi à planifier mes finances professionnelles",
        "Comparez les taux d'imposition entre les pays"
      ]
    };
    return suggestions[language as keyof typeof suggestions] || suggestions.en;
  };

  const suggestedQuestions = getSuggestedQuestions();

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI Financial Advisor
        </CardTitle>
        <CardDescription>
          Get personalized tax and financial advice powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(question);
                  }}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about taxes, expenses, or financial planning..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAdvisor;
