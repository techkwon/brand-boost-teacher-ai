
import { supabase } from '@/integrations/supabase/client';
import { TeacherReport } from '@/types/report';

export async function uploadImageToSupabase(imageBlob: Blob, fileName: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('teacher-images')
    .upload(fileName, imageBlob, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    throw new Error(`이미지 업로드 실패: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('teacher-images')
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function saveReportToSupabase(report: TeacherReport): Promise<string> {
  const { data, error } = await supabase
    .from('teacher_reports')
    .insert({
      character_name: report.character.name,
      character_description: report.character.description,
      slogan: report.slogan,
      strengths: report.strengths,
      growth_point_title: report.growth_point.title,
      growth_point_description: report.growth_point.description,
      image_url: report.imageUrl
    })
    .select()
    .single();

  if (error) {
    throw new Error(`결과 저장 실패: ${error.message}`);
  }

  return data.id;
}

export async function loadReportsFromSupabase(): Promise<TeacherReport[]> {
  const { data, error } = await supabase
    .from('teacher_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`데이터 로딩 실패: ${error.message}`);
  }

  return data.map(item => ({
    id: item.id,
    character: {
      name: item.character_name,
      description: item.character_description
    },
    slogan: item.slogan,
    strengths: item.strengths,
    growth_point: {
      title: item.growth_point_title,
      description: item.growth_point_description
    },
    imageUrl: item.image_url,
    createdAt: item.created_at
  }));
}
