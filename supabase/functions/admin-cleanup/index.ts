import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 토큰 검증 함수
function verifyAdminToken(token: string): boolean {
  try {
    const decoded = JSON.parse(atob(token));
    return decoded.admin === true && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 토큰 검증
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return new Response(
        JSON.stringify({ error: '유효하지 않은 토큰입니다.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const { keepCount } = await req.json();
    const targetCount = keepCount || 500;

    console.log(`Starting cleanup to keep ${targetCount} reports...`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 전체 리포트 개수 확인
    const { count, error: countError } = await supabase
      .from('teacher_reports')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting reports:', countError);
      throw countError;
    }

    console.log(`Total reports: ${count}, Target: ${targetCount}`);

    if (count && count > targetCount) {
      const deleteCount = count - targetCount;
      console.log(`Need to delete ${deleteCount} old reports`);

      // 삭제할 오래된 리포트 조회
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
            const parts = url.split('/');
            const fileName = parts[parts.length - 1];
            return fileName;
          })
          .filter(path => path && path.length > 0);

        if (imagePaths.length > 0) {
          console.log(`Deleting ${imagePaths.length} images from storage...`);
          
          const { error: storageError } = await supabase.storage
            .from('teacher-images')
            .remove(imagePaths);

          if (storageError) {
            console.error('Error deleting images from storage:', storageError);
          } else {
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
            remainingCount: targetCount,
            message: `${oldReports.length}개의 오래된 리포트가 삭제되었습니다.`
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
        message: '정리가 필요하지 않습니다.',
        currentCount: count,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in admin-cleanup function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
