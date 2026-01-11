import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Map common crypto symbols to CoinGecko IDs
const symbolToId: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'XRP': 'ripple',
  'SOL': 'solana',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'AVAX': 'avalanche-2',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'XLM': 'stellar',
  'ALGO': 'algorand',
  'VET': 'vechain',
  'FIL': 'filecoin',
  'SAND': 'the-sandbox',
  'MANA': 'decentraland',
  'APE': 'apecoin',
  'SHIB': 'shiba-inu',
  'CRO': 'crypto-com-chain',
  'NEAR': 'near',
  'FTM': 'fantom',
  'AAVE': 'aave',
  'GRT': 'the-graph',
  'MKR': 'maker',
  'SNX': 'havven',
  'COMP': 'compound-governance-token',
  'LDO': 'lido-dao',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'PEPE': 'pepe',
  'SUI': 'sui',
  'SEI': 'sei-network',
  'TIA': 'celestia',
  'INJ': 'injective-protocol',
  'BITCOIN': 'bitcoin',
  'ETHEREUM': 'ethereum',
  'SOLANA': 'solana',
  'CARDANO': 'cardano',
  'DOGECOIN': 'dogecoin',
  'POLKADOT': 'polkadot',
  'CHAINLINK': 'chainlink',
  'LITECOIN': 'litecoin',
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide an array of crypto symbols" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert symbols to CoinGecko IDs
    const coinIds: string[] = [];
    const symbolMapping: Record<string, string> = {};
    
    for (const symbol of symbols) {
      const upperSymbol = symbol.toUpperCase().trim();
      const coinId = symbolToId[upperSymbol] || symbol.toLowerCase();
      coinIds.push(coinId);
      symbolMapping[coinId] = upperSymbol;
    }

    const uniqueIds = [...new Set(coinIds)];
    const idsParam = uniqueIds.join(',');

    console.log(`Fetching prices for: ${idsParam}`);

    // Fetch current prices
    const priceResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=eur,usd&include_24hr_change=true&include_last_updated_at=true`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!priceResponse.ok) {
      const errorText = await priceResponse.text();
      console.error('CoinGecko API error:', errorText);
      throw new Error(`CoinGecko API error: ${priceResponse.status}`);
    }

    const priceData = await priceResponse.json();

    // Fetch 7-day chart data for each coin
    const chartPromises = uniqueIds.slice(0, 5).map(async (coinId) => {
      try {
        const chartResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=eur&days=7`,
          {
            headers: { 'Accept': 'application/json' }
          }
        );
        if (chartResponse.ok) {
          const chartData = await chartResponse.json();
          return { coinId, prices: chartData.prices };
        }
      } catch (e) {
        console.error(`Failed to fetch chart for ${coinId}:`, e);
      }
      return { coinId, prices: [] };
    });

    const chartResults = await Promise.all(chartPromises);
    const chartData: Record<string, number[][]> = {};
    for (const result of chartResults) {
      chartData[result.coinId] = result.prices;
    }

    // Format response
    const result: Record<string, {
      price_eur: number;
      price_usd: number;
      change_24h: number;
      last_updated: number;
      chart_7d?: number[][];
    }> = {};

    for (const [coinId, data] of Object.entries(priceData)) {
      const priceInfo = data as any;
      const originalSymbol = symbolMapping[coinId] || coinId.toUpperCase();
      
      result[originalSymbol] = {
        price_eur: priceInfo.eur || 0,
        price_usd: priceInfo.usd || 0,
        change_24h: priceInfo.eur_24h_change || 0,
        last_updated: priceInfo.last_updated_at || Date.now() / 1000,
        chart_7d: chartData[coinId] || undefined,
      };
    }

    console.log(`Successfully fetched prices for ${Object.keys(result).length} coins`);

    return new Response(
      JSON.stringify({ prices: result, fetched_at: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Crypto price fetch error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to fetch prices" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
