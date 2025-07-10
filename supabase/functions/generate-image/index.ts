import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log('이미지 생성 요청 받음:', prompt);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiApiKey}`;
    
    const payload = {
      instances: [{ prompt: prompt }],
      parameters: { "sampleCount": 1 }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Gemini Image API 오류: ${response.status}`, await response.text());
      throw new Error(`이미지 생성 API 오류: ${response.status}`);
    }

    const result = await response.json();
    console.log('이미지 생성 완료');
    
    if (result.predictions && result.predictions.length > 0) {
      const base64Data = result.predictions[0].bytesBase64Encoded;
      
      // Return the base64 data directly
      return new Response(JSON.stringify({ base64Data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('AI로부터 이미지 생성 결과를 받지 못했습니다.');
    }

  } catch (error) {
    console.error('이미지 생성 오류:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});