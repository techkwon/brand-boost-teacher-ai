import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting DB and Storage sync...');

    // 스토리지에서 모든 파일 목록 가져오기
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('teacher-images')
      .list();

    if (storageError) {
      console.error('Error listing storage files:', storageError);
      throw storageError;
    }

    console.log(`Found ${storageFiles.length} files in storage`);

    // 스토리지 파일명 집합 생성
    const storageFileNames = new Set(storageFiles.map(file => file.name));

    // DB에서 모든 리포트 가져오기
    const { data: allReports, error: dbError } = await supabase
      .from('teacher_reports')
      .select('id, image_url');

    if (dbError) {
      console.error('Error fetching reports:', dbError);
      throw dbError;
    }

    console.log(`Found ${allReports.length} reports in DB`);

    // 스토리지에 파일이 없는 DB 레코드 찾기
    const orphanReports = allReports.filter(report => {
      const url = report.image_url;
      const parts = url.split('/');
      const fileName = parts[parts.length - 1];
      return !storageFileNames.has(fileName);
    });

    console.log(`Found ${orphanReports.length} orphan records (DB records without storage files)`);

    if (orphanReports.length > 0) {
      const orphanIds = orphanReports.map(r => r.id);
      const { error: deleteError } = await supabase
        .from('teacher_reports')
        .delete()
        .in('id', orphanIds);

      if (deleteError) {
        console.error('Error deleting orphan records:', deleteError);
        throw deleteError;
      }

      console.log(`Successfully deleted ${orphanReports.length} orphan records`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        storageFiles: storageFiles.length,
        dbRecords: allReports.length,
        orphansDeleted: orphanReports.length,
        finalDbCount: allReports.length - orphanReports.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
