import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FRAUDLABS_API_KEY = Deno.env.get('FRAUDLABS_API_KEY');
    if (!FRAUDLABS_API_KEY) {
      throw new Error('FRAUDLABS_API_KEY is not configured');
    }

    const { action, phone_number, otp, tran_id } = await req.json();

    if (action === 'send') {
      if (!phone_number) {
        throw new Error('Phone number is required');
      }

      // Send OTP via FraudLabs Pro SMS Verification API
      const params = new URLSearchParams({
        key: FRAUDLABS_API_KEY,
        tel: phone_number,
        format: 'json',
        mesg: 'Your Legio verification code is <otp>.',
        otp_timeout: '120',
        country_code: '',
      });

      const response = await fetch(
        `https://api.fraudlabspro.com/v1/verification/send?${params.toString()}`,
        { method: 'GET' }
      );

      const data = await response.json();
      console.log('FraudLabs send response:', JSON.stringify(data));

      if (!response.ok || data.error) {
        throw new Error(`FraudLabs API error: ${data.error?.error_message || JSON.stringify(data)}`);
      }

      return new Response(JSON.stringify({
        success: true,
        tran_id: data.tran_id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'verify') {
      if (!tran_id || !otp) {
        throw new Error('Transaction ID and OTP are required');
      }

      const params = new URLSearchParams({
        key: FRAUDLABS_API_KEY,
        tran_id: tran_id,
        otp: otp,
        format: 'json',
      });

      const response = await fetch(
        `https://api.fraudlabspro.com/v1/verification/result?${params.toString()}`,
        { method: 'GET' }
      );

      const data = await response.json();
      console.log('FraudLabs verify response:', JSON.stringify(data));

      if (!response.ok) {
        throw new Error(`FraudLabs verify error [${response.status}]: ${JSON.stringify(data)}`);
      }

      const isVerified = data.result === 'Y';

      return new Response(JSON.stringify({
        success: true,
        verified: isVerified,
        result: data.result,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      throw new Error('Invalid action. Use "send" or "verify".');
    }

  } catch (error: unknown) {
    console.error('Phone verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
