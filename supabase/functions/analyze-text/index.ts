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
    const { answers } = await req.json();
    console.log('텍스트 분석 요청 받음:', answers);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    }

    const prompt = `
# ROLE
당신은 대한민국 교사들의 개인 브랜딩을 돕는 전문 컨설턴트입니다. 당신의 임무는 교사가 제출한 설문 답변을 깊이 있게 분석하여, 긍정적이고 통찰력 넘치는 개인 맞춤형 브랜딩 리포트를 생성하는 것입니다.

# RULES
1. **JSON 출력 엄수**: 반드시 지정된 JSON 형식으로만 응답해야 합니다. 다른 설명이나 인사말, 코드 블록 마크다운을 절대 포함하지 마세요. 오직 유효한 JSON 객체만 출력해야 합니다.
2. **답변 기반 분석**: 모든 분석 결과는 사용자가 입력한 답변에 명확한 근거를 두어야 합니다.
3. **긍정적이고 구체적인 언어**: '약점'이나 '단점' 대신 '성장점(Growth Point)'이라는 긍정적인 표현을 사용하세요.
4. **독창적인 결과물**: 사용자의 답변을 조합하여 세상에 하나뿐인 독창적인 캐릭터 이름과 슬로건을 창조하세요.
5. **영문 이미지 프롬프트 생성**: 분석된 캐릭터 설명을 바탕으로, 이미지 생성 AI가 그림을 그릴 수 있도록 상세하고 창의적인 영문 프롬프트를 'image_prompt' 필드에 생성해야 합니다.

# OUTPUT_STRUCTURE
{
  "character": { "name": "AI가 생성한 캐릭터 이름", "description": "AI가 생성한 캐릭터 상세 설명." },
  "slogan": "AI가 생성한 개인 맞춤형 슬로건",
  "strengths": [ "AI가 분석한 강점 1", "AI가 분석한 강점 2" ],
  "growth_point": { "title": "AI가 제안하는 성장점의 제목", "description": "AI가 제안하는 성장점에 대한 구체적인 설명" },
  "image_prompt": "A detailed, descriptive English prompt for an image generation AI. (e.g., 'A friendly, wise owl wearing a graduation cap, holding a glowing book, cartoon style, warm and inviting colors, clean vector art')"
}

# REAL_REQUEST
## INPUT:
[사용자 설문 답변]
Q1. 수업 스타일: ${answers.Q1}
Q2. 자기 비유: ${answers.Q2}
Q3. 기억되고 싶은 키워드: ${answers.Q3}
Q4. 나의 강점: ${answers.Q4}
Q5. 고민/성장점: ${answers.Q5}
## OUTPUT:
`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      console.error(`Gemini API 오류: ${response.status}`, await response.text());
      throw new Error(`텍스트 분석 API 오류: ${response.status}`);
    }

    const result = await response.json();
    console.log('Gemini API 응답:', result);
    
    if (result.candidates && result.candidates.length > 0) {
      const text = result.candidates[0].content.parts[0].text;
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysisResult = JSON.parse(cleanedText);
      
      console.log('텍스트 분석 완료:', analysisResult);
      return new Response(JSON.stringify(analysisResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('AI로부터 텍스트 분석 결과를 받지 못했습니다.');
    }

  } catch (error) {
    console.error('텍스트 분석 오류:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '텍스트 분석 중 오류가 발생했습니다.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});