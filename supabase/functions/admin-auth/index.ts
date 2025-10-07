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
    const { password } = await req.json();
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');

    console.log('Admin authentication attempt');

    if (!adminPassword) {
      throw new Error('Admin password not configured');
    }

    if (password === adminPassword) {
      // 비밀번호가 맞으면 간단한 토큰 생성 (24시간 유효)
      const token = btoa(JSON.stringify({
        admin: true,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24시간
      }));

      console.log('Admin authentication successful');

      return new Response(
        JSON.stringify({ 
          success: true, 
          token 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      console.log('Admin authentication failed: invalid password');
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '비밀번호가 올바르지 않습니다.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }
  } catch (error) {
    console.error('Error in admin-auth function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
