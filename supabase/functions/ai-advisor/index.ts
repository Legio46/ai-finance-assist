import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  const corsHeaders = getCorsHeaders(req);

  try {
    const { message, context, language = 'en', mode = 'personal' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("AI Advisor request received:", { message, context, language, mode });

    const personalPrompts: Record<string, string> = {
      en: `You are a friendly personal finance AI assistant for Legio Financial.
Your expertise includes:
- Personal budgeting and expense management
- Savings strategies and goal planning
- Investment basics and portfolio guidance
- Spending pattern analysis and optimization
- Income tracking and financial health assessment
- Debt management and repayment strategies

Provide clear, actionable personal finance advice. Be supportive and encouraging.
If the user's context includes financial data, use it to give personalized recommendations.
Keep responses concise (2-3 paragraphs) unless asked for detailed explanations.
Respond in English.`,
      sk: `Si priateľský osobný finančný AI asistent pre Legio Financial.
Tvoja odbornosť zahŕňa:
- Osobný rozpočet a správa výdavkov
- Stratégie sporenia a plánovanie cieľov
- Základy investovania a poradenstvo k portfóliu
- Analýza a optimalizácia vzorcov míňania
- Sledovanie príjmov a hodnotenie finančného zdravia
- Správa dlhov a stratégie splácania

Poskytuj jasné, použiteľné rady o osobných financiách. Buď podporný a povzbudzujúci.
Odpovedaj po slovensky.`,
      de: `Sie sind ein freundlicher persönlicher Finanz-KI-Assistent für Legio Financial.
Ihre Expertise umfasst:
- Persönliche Budgetierung und Ausgabenverwaltung
- Sparstrategien und Zielplanung
- Investitionsgrundlagen und Portfolio-Beratung
- Analyse und Optimierung von Ausgabemustern
- Einkommensverfolgung und Bewertung der finanziellen Gesundheit
- Schuldenmanagement und Rückzahlungsstrategien

Geben Sie klare, umsetzbare Ratschläge zu persönlichen Finanzen.
Antworten Sie auf Deutsch.`,
      fr: `Vous êtes un assistant IA amical en finances personnelles pour Legio Financial.
Votre expertise comprend:
- Budget personnel et gestion des dépenses
- Stratégies d'épargne et planification d'objectifs
- Bases de l'investissement et conseil en portefeuille
- Analyse et optimisation des habitudes de dépenses
- Suivi des revenus et évaluation de la santé financière
- Gestion des dettes et stratégies de remboursement

Fournissez des conseils clairs et exploitables sur les finances personnelles.
Répondez en français.`
    };

    const supportPrompts: Record<string, string> = {
      en: `You are a helpful customer support AI assistant for Legio Financial platform.
Your role is to help users with:
- Navigating the Legio platform (dashboard, features, settings)
- Understanding subscription plans (Personal Basic at €5/month, Personal Pro at €10/month, Business coming soon)
- Personal Basic features: expense tracking, income tracking, budget management, dashboard analytics, data export (CSV/PDF)
- Personal Pro features: everything in Basic plus recurring payments, investment tracking, financial calendar, AI calendar suggestions, financial planner
- Account management (profile, security settings, two-factor authentication)
- Technical issues and troubleshooting
- Currency converter (free, no login required)
- Affiliate program questions
- The platform serves users globally and supports multiple currencies

Be helpful, patient, and guide users step by step. If you don't know something specific about the platform, say so honestly.
Respond in English.`,
      sk: `Si nápomocný AI asistent zákazníckej podpory pre platformu Legio Financial.
Tvoja úloha je pomáhať používateľom s:
- Navigáciou na platforme Legio (dashboard, funkcie, nastavenia)
- Pochopením predplatných plánov (Personal Basic za 5€/mesiac, Personal Pro za 10€/mesiac, Business čoskoro)
- Správou účtu, bezpečnostnými nastaveniami
- Technickými problémami a riešením problémov
- Otázkami o affiliate programe
- Platforma slúži používateľom globálne

Buď nápomocný a trpezlivý. Odpovedaj po slovensky.`,
      de: `Sie sind ein hilfreicher Kundensupport-KI-Assistent für die Legio Financial Plattform.
Ihre Rolle ist es, Benutzern zu helfen mit:
- Navigation auf der Legio-Plattform
- Verständnis der Abonnementpläne (Personal Basic 5€/Monat, Personal Pro 10€/Monat, Business kommt bald)
- Kontoverwaltung und Sicherheitseinstellungen
- Technischen Problemen und Fehlerbehebung

Seien Sie hilfsbereit und geduldig. Antworten Sie auf Deutsch.`,
      fr: `Vous êtes un assistant IA de support client utile pour la plateforme Legio Financial.
Votre rôle est d'aider les utilisateurs avec:
- La navigation sur la plateforme Legio
- La compréhension des plans d'abonnement (Personal Basic 5€/mois, Personal Pro 10€/mois, Business bientôt)
- La gestion de compte et les paramètres de sécurité
- Les problèmes techniques et le dépannage

Soyez utile et patient. Répondez en français.`
    };

    const prompts = mode === 'support' ? supportPrompts : personalPrompts;
    const systemPrompt = prompts[language as keyof typeof prompts] || prompts.en;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in ai-advisor function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
