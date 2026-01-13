import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

// Popular stock symbols for auto-complete
const popularStocks: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'NVDA': 'NVIDIA Corporation',
  'META': 'Meta Platforms Inc.',
  'TSLA': 'Tesla Inc.',
  'BRK.B': 'Berkshire Hathaway',
  'JPM': 'JPMorgan Chase',
  'V': 'Visa Inc.',
  'JNJ': 'Johnson & Johnson',
  'WMT': 'Walmart Inc.',
  'PG': 'Procter & Gamble',
  'MA': 'Mastercard Inc.',
  'HD': 'Home Depot Inc.',
  'DIS': 'Walt Disney Co.',
  'BAC': 'Bank of America',
  'XOM': 'Exxon Mobil',
  'PFE': 'Pfizer Inc.',
  'KO': 'Coca-Cola Co.',
  'PEP': 'PepsiCo Inc.',
  'NFLX': 'Netflix Inc.',
  'AMD': 'Advanced Micro Devices',
  'INTC': 'Intel Corporation',
  'CRM': 'Salesforce Inc.',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  const corsHeaders = getCorsHeaders(req);

  try {
    const { symbols } = await req.json();
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide an array of stock symbols" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching stock prices for: ${symbols.join(', ')}`);

    const result: Record<string, {
      price_eur: number;
      price_usd: number;
      change_24h: number;
      name: string;
      last_updated: number;
    }> = {};

    // Fetch stock data for each symbol using Yahoo Finance API
    for (const symbol of symbols.slice(0, 10)) { // Limit to 10 stocks
      try {
        const upperSymbol = symbol.toUpperCase().trim();
        
        // Use Yahoo Finance v8 API (publicly accessible)
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(upperSymbol)}?interval=1d&range=5d`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const quote = data.chart?.result?.[0];
          
          if (quote && quote.meta) {
            const meta = quote.meta;
            const regularMarketPrice = meta.regularMarketPrice || 0;
            const previousClose = meta.previousClose || meta.chartPreviousClose || regularMarketPrice;
            const change = previousClose > 0 ? ((regularMarketPrice - previousClose) / previousClose) * 100 : 0;
            
            // Get EUR conversion (approximate, using fixed rate as fallback)
            const eurRate = 0.92; // USD to EUR approximate rate
            
            result[upperSymbol] = {
              price_usd: regularMarketPrice,
              price_eur: regularMarketPrice * eurRate,
              change_24h: change,
              name: popularStocks[upperSymbol] || meta.shortName || meta.symbol || upperSymbol,
              last_updated: Date.now() / 1000,
            };
            
            console.log(`Fetched ${upperSymbol}: $${regularMarketPrice}`);
          }
        } else {
          console.error(`Failed to fetch ${symbol}: ${response.status}`);
        }
      } catch (e) {
        console.error(`Error fetching ${symbol}:`, e);
      }
    }

    console.log(`Successfully fetched prices for ${Object.keys(result).length} stocks`);

    return new Response(
      JSON.stringify({ 
        prices: result, 
        fetched_at: new Date().toISOString(),
        popular_stocks: Object.keys(popularStocks)
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Stock price fetch error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to fetch stock prices" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
