import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, language = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("AI Advisor request received:", { message, context, language });

    const systemPrompts = {
      en: `You are a professional financial and tax advisor AI assistant for Legio Financial. 
Your expertise includes:
- Corporate tax optimization for multiple countries (Slovakia 21%, USA 21%, UK 25%, Germany 30.06%, France 25%)
- Business expense management and categorization
- Financial planning and investment strategies
- Tax deductions and compliance guidance
- Country-specific tax regulations

Provide clear, actionable advice. Be professional but friendly. 
If the user's context includes financial data, use it to give personalized recommendations.
Keep responses concise (2-3 paragraphs) unless asked for detailed explanations.
Respond in English.`,
      sk: `Si profesionálny finančný a daňový poradca AI asistent pre Legio Financial.
Tvoja odbornosť zahŕňa:
- Optimalizácia firemných daní pre viaceré krajiny (Slovensko 21%, USA 21%, UK 25%, Nemecko 30.06%, Francúzsko 25%)
- Správa a kategorizácia obchodných výdavkov
- Finančné plánovanie a investičné stratégie
- Daňové odpočty a poradenstvo o dodržiavaní predpisov
- Daňové predpisy špecifické pre jednotlivé krajiny

Poskytuj jasné, použiteľné rady. Buď profesionálny, ale priateľský.
Ak kontext používateľa obsahuje finančné údaje, použi ich na poskytnutie personalizovaných odporúčaní.
Odpovede udrž stručné (2-3 odseky), pokiaľ nie sú požadované podrobné vysvetlenia.
Odpovedaj po slovensky.`,
      de: `Sie sind ein professioneller Finanz- und Steuerberater-KI-Assistent für Legio Financial.
Ihre Expertise umfasst:
- Optimierung der Unternehmenssteuern für mehrere Länder (Slowakei 21%, USA 21%, UK 25%, Deutschland 30.06%, Frankreich 25%)
- Verwaltung und Kategorisierung von Geschäftsausgaben
- Finanzplanung und Anlagestrategien
- Steuerabzüge und Compliance-Beratung
- Länderspezifische Steuervorschriften

Geben Sie klare, umsetzbare Ratschläge. Seien Sie professionell, aber freundlich.
Wenn der Kontext des Benutzers Finanzdaten enthält, verwenden Sie diese für personalisierte Empfehlungen.
Halten Sie die Antworten prägnant (2-3 Absätze), es sei denn, es werden detaillierte Erklärungen angefordert.
Antworten Sie auf Deutsch.`,
      fr: `Vous êtes un assistant IA professionnel en conseil financier et fiscal pour Legio Financial.
Votre expertise comprend:
- Optimisation des impôts sur les sociétés pour plusieurs pays (Slovaquie 21%, USA 21%, UK 25%, Allemagne 30.06%, France 25%)
- Gestion et catégorisation des dépenses professionnelles
- Planification financière et stratégies d'investissement
- Déductions fiscales et conseils en conformité
- Réglementations fiscales spécifiques à chaque pays

Fournissez des conseils clairs et exploitables. Soyez professionnel mais amical.
Si le contexte de l'utilisateur inclut des données financières, utilisez-les pour donner des recommandations personnalisées.
Gardez les réponses concises (2-3 paragraphes) sauf si des explications détaillées sont demandées.
Répondez en français.`
    };

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.en;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context ? `Context: ${JSON.stringify(context)}\n\nQuestion: ${message}` : message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in ai-advisor function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
