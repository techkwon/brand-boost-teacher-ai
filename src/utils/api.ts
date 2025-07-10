import { UserAnswers, AIAnalysisResult } from '@/types/report';
import { supabase } from '@/integrations/supabase/client';

export async function callGeminiTextAPI(answers: UserAnswers): Promise<AIAnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-text', {
    body: { answers }
  });

  if (error) {
    console.error('텍스트 분석 오류:', error);
    throw new Error(`텍스트 분석 API 오류: ${error.message}`);
  }

  return data;
}

export async function callGeminiImageAPI(prompt: string): Promise<Blob> {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: { prompt }
  });

  if (error) {
    console.error('이미지 생성 오류:', error);
    throw new Error(`이미지 생성 API 오류: ${error.message}`);
  }

  // Convert base64 to blob
  const base64Data = data.base64Data;
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/png' });
}

export function base64ToBlob(base64: string): Blob {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/png' });
}
