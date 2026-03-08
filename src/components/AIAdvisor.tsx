import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User, Wallet, HelpCircle, Sparkles, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

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
  const [mode, setMode] = useState<'personal' | 'support'>('personal');

  const getGreeting = (m: string) => {
    if (m === 'personal') {
      const greetings: Record<string, string> = {
        en: "Hello! I'm your AI Financial Advisor. I can help you with budgeting, savings strategies, spending analysis, investment guidance, and financial planning. How can I assist you today?",
        sk: "Ahoj! Som váš AI finančný poradca. Môžem vám pomôcť s rozpočtom, stratégiami sporenia, analýzou výdavkov, investičným poradenstvom a finančným plánovaním. Ako vám môžem pomôcť?",
        de: "Hallo! Ich bin Ihr KI-Finanzberater. Ich kann Ihnen bei Budgetierung, Sparstrategien, Ausgabenanalyse, Anlageberatung und Finanzplanung helfen. Wie kann ich Ihnen helfen?",
        fr: "Bonjour! Je suis votre conseiller financier IA. Je peux vous aider avec le budget, les stratégies d'épargne, l'analyse des dépenses et la planification financière. Comment puis-je vous aider?"
      };
      return greetings[language] || greetings.en;
    }
    const greetings: Record<string, string> = {
      en: "Hello! I'm Legio's support assistant. I can help you navigate the platform, understand our plans, troubleshoot issues, and answer questions about features. How can I help?",
      sk: "Ahoj! Som podporný asistent Legio. Môžem vám pomôcť s navigáciou na platforme, pochopením plánov, riešením problémov a odpovedať na otázky o funkciách. Ako vám môžem pomôcť?",
      de: "Hallo! Ich bin der Support-Assistent von Legio. Ich kann Ihnen bei der Plattformnavigation, dem Verständnis unserer Pläne und der Fehlerbehebung helfen. Wie kann ich helfen?",
      fr: "Bonjour! Je suis l'assistant support de Legio. Je peux vous aider à naviguer sur la plateforme, comprendre nos plans et résoudre des problèmes. Comment puis-je vous aider?"
    };
    return greetings[language] || greetings.en;
  };

  const [personalMessages, setPersonalMessages] = useState<Message[]>([
    { role: 'assistant', content: getGreeting('personal') }
  ]);
  const [supportMessages, setSupportMessages] = useState<Message[]>([
    { role: 'assistant', content: getGreeting('support') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const messages = mode === 'personal' ? personalMessages : supportMessages;
  const setMessages = mode === 'personal' ? setPersonalMessages : setSupportMessages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/ai-advisor`;

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    try {
      const resp = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          message: userMessage,
          context: userContext,
          language,
          mode,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({ title: "Rate Limit", description: "Too many requests. Please try again in a moment.", variant: "destructive" });
          return;
        }
        if (resp.status === 402) {
          toast({ title: "Usage Limit", description: "AI usage limit reached. Please contact support.", variant: "destructive" });
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
          if (jsonStr === "[DONE]") { streamDone = true; break; }

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
      toast({ title: "Error", description: "Failed to get AI response. Please try again.", variant: "destructive" });
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
    if (mode === 'support') {
      const suggestions: Record<string, string[]> = {
        en: ["What features are in Personal Pro?", "How do I export my data?", "How do I upgrade my plan?", "How does the affiliate program work?"],
        sk: ["Aké funkcie sú v Personal Pro?", "Ako exportujem svoje dáta?", "Ako upgradnem svoj plán?", "Ako funguje affiliate program?"],
        de: ["Welche Funktionen bietet Personal Pro?", "Wie exportiere ich meine Daten?", "Wie upgrade ich meinen Plan?", "Wie funktioniert das Partnerprogramm?"],
        fr: ["Quelles fonctionnalités offre Personal Pro?", "Comment exporter mes données?", "Comment mettre à niveau mon plan?", "Comment fonctionne le programme d'affiliation?"]
      };
      return suggestions[language] || suggestions.en;
    }
    const suggestions: Record<string, string[]> = {
      en: ["How can I reduce my monthly spending?", "Help me create a savings plan", "What's the best way to budget?", "Analyze my spending patterns"],
      sk: ["Ako môžem znížiť mesačné výdavky?", "Pomôž mi vytvoriť plán sporenia", "Aký je najlepší spôsob rozpočtovania?", "Analyzuj moje vzorce míňania"],
      de: ["Wie kann ich meine Ausgaben reduzieren?", "Hilf mir einen Sparplan zu erstellen", "Was ist der beste Weg zu budgetieren?", "Analysiere meine Ausgabenmuster"],
      fr: ["Comment réduire mes dépenses mensuelles?", "Aide-moi à créer un plan d'épargne", "Quelle est la meilleure façon de budgétiser?", "Analyse mes habitudes de dépenses"]
    };
    return suggestions[language] || suggestions.en;
  };

  const suggestedQuestions = getSuggestedQuestions();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        {/* Mode Switcher */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="p-1.5 bg-muted/50">
            <button
              onClick={() => setMode('personal')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                mode === 'personal'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                mode === 'personal' ? 'bg-primary-foreground/20' : 'bg-primary/10'
              }`}>
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div>Financial Advisor</div>
                <div className={`text-xs ${mode === 'personal' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  AI-powered guidance
                </div>
              </div>
            </button>
            <button
              onClick={() => setMode('support')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mt-1 ${
                mode === 'support'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                mode === 'support' ? 'bg-primary-foreground/20' : 'bg-primary/10'
              }`}>
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div>Customer Support</div>
                <div className={`text-xs ${mode === 'support' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  Help & troubleshooting
                </div>
              </div>
            </button>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1">
              {mode === 'personal' ? 'Smart Finance AI' : 'Legio Support'}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {mode === 'personal'
                ? 'Get personalized budgeting tips, savings strategies, and spending insights powered by AI.'
                : 'Get help with platform features, billing questions, and technical issues.'}
            </p>
          </div>
        </Card>
      </div>

      {/* Chat Area */}
      <Card className="lg:col-span-3 h-[650px] flex flex-col border-0 shadow-lg overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b bg-card flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-card" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">
              {mode === 'personal' ? 'Financial Advisor' : 'Customer Support'}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              Online · Typically replies instantly
            </p>
          </div>
        </div>

        {/* Messages */}
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <ScrollArea className="flex-1 px-6" ref={scrollRef}>
            <div className="space-y-5 py-5">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[75%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md shadow-md'
                        : 'bg-muted/70 text-foreground rounded-bl-md border border-border/50'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-muted/70 border border-border/50">
                    <div className="flex gap-1.5 items-center h-5">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {t('tryAsking')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="text-left text-xs px-3.5 py-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t bg-card/50 p-4">
            <div className="flex gap-2 items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mode === 'support' ? 'Ask about Legio features, plans, or get help...' : t('aiAdvisorPlaceholder')}
                disabled={isLoading}
                className="flex-1 rounded-xl border-border/60 bg-muted/30 focus-visible:bg-card h-11"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-11 w-11 rounded-xl shrink-0 shadow-md"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAdvisor;
