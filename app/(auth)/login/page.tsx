'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loginSchema, LoginInput } from '@/lib/schemas';
import { authService } from '@/lib/auth-service';
import { setTokens } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { setLoading, login } = useAuthStore();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setLoading(true);
      const result = await authService.login(data.email, data.password);
      setTokens(result.accessToken, result.refreshToken);
      login(result.user);
      router.push('/dashboard');
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Invalid credentials' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1F232A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#FD5E2B] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FD5E2B] rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <h1 className="text-5xl font-bold mb-6">RBAC System</h1>
          <p className="text-xl text-gray-300 text-center max-w-md">Role-Based Access Control for secure user management</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#1F232A]">RBAC System</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1F232A]">Sign In</h2>
            <p className="text-[#404857] mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F232A] mb-1">Email</label>
              <Input type="email" placeholder="admin@system.com" error={errors.email?.message} {...register('email')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F232A] mb-1">Password</label>
              <Input type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            </div>

            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.root.message}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>Sign In</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#404857]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#FD5E2B] hover:underline font-medium">Create Account</Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-[#404857] text-center">Demo: admin@system.com / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}