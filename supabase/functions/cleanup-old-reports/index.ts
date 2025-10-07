import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_REPORTS = 400; // 무료 티어 1GB 제한을 위해 400개로 조정

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking total reports count...');

    // 전체 리포트 개수 확인
    const { count, error: countError } = await supabase
      .from('teacher_reports')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting reports:', countError);
      throw countError;
    }

    console.log(`Total reports: ${count}, Max allowed: ${MAX_REPORTS}`);

    if (count && count > MAX_REPORTS) {
      const deleteCount = count - MAX_REPORTS;
      console.log(`Need to delete ${deleteCount} old reports`);

      // 삭제할 오래된 리포트 조회 (이미지 URL 포함)
      const { data: oldReports, error: fetchError } = await supabase
        .from('teacher_reports')
        .select('id, image_url')
        .order('created_at', { ascending: true })
        .limit(deleteCount);

      if (fetchError) {
        console.error('Error fetching old reports:', fetchError);
        throw fetchError;
      }

      if (oldReports && oldReports.length > 0) {
        console.log(`Deleting ${oldReports.length} reports...`);

        // Storage에서 이미지 삭제
        const imagePaths = oldReports
          .map(report => {
            const url = report.image_url;
            // URL에서 파일 이름만 추출
            const parts = url.split('/');
            const fileName = parts[parts.length - 1];
            console.log(`Extracting filename: ${fileName} from ${url}`);
            return fileName;
          })
          .filter(path => path && path.length > 0);

        if (imagePaths.length > 0) {
          console.log(`Deleting ${imagePaths.length} images from storage...`);
          console.log('File paths to delete:', imagePaths);
          
          const { data: deleteData, error: storageError } = await supabase.storage
            .from('teacher-images')
            .remove(imagePaths);

          if (storageError) {
            console.error('Error deleting images from storage:', storageError);
            // 스토리지 삭제 실패해도 계속 진행
          } else {
            console.log('Storage delete response:', deleteData);
            console.log(`Successfully deleted ${imagePaths.length} images from storage`);
          }
        }

        // DB에서 리포트 삭제
        const idsToDelete = oldReports.map(report => report.id);
        const { error: deleteError } = await supabase
          .from('teacher_reports')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          console.error('Error deleting reports from DB:', deleteError);
          throw deleteError;
        }

        console.log(`Successfully deleted ${oldReports.length} old reports`);

        return new Response(
          JSON.stringify({
            success: true,
            deletedCount: oldReports.length,
            remainingCount: MAX_REPORTS,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    console.log('No cleanup needed');
    return new Response(
      JSON.stringify({
        success: true,
        message: 'No cleanup needed',
        currentCount: count,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in cleanup function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
