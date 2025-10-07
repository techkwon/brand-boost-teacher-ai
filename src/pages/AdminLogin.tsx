import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { password }
      });

      if (error) throw error;

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        toast({
          title: '로그인 성공',
          description: '관리자 페이지로 이동합니다.',
        });
        navigate('/admin');
      } else {
        toast({
          title: '로그인 실패',
          description: data.error || '비밀번호를 확인해주세요.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: '오류 발생',
        description: '로그인 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-teal-700 mb-6 text-center">관리자 로그인</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="관리자 비밀번호를 입력하세요"
              required
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            홈으로 돌아가기
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
