// Shared CORS configuration for edge functions
// Validates origins against an allowlist for security

const ALLOWED_ORIGINS = [
  // Production domains - add your production domain here
  'https://ehohaixttjnvoylviuda.lovable.app',
  'https://ehohaixttjnvoylviuda.lovableproject.com',
  // Lovable preview domains
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,
  // Local development
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
];

export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  
  // Check if origin matches any allowed origin
  const isAllowed = ALLOWED_ORIGINS.some(allowed => {
    if (typeof allowed === 'string') {
      return origin === allowed;
    }
    // Regex pattern matching
    return allowed.test(origin);
  });
  
  // If origin is allowed, return it; otherwise return the first allowed origin
  const allowedOrigin = isAllowed ? origin : 'https://ehohaixttjnvoylviuda.lovable.app';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(request),
    });
  }
  return null;
}
