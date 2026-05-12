'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { registerSchema, RegisterInput } from '@/lib/schemas';
import { authService } from '@/lib/auth-service';
import { setTokens } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';
import { Button, Input } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const { setLoading, login } = useAuthStore();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setLoading(true);
      const result = await authService.register(data);
      setTokens(result.accessToken, result.refreshToken);
      login(result.user);
      router.push('/dashboard');
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Registration failed' });
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
          <h1 className="text-5xl font-bold mb-6">Join Us</h1>
          <p className="text-xl text-gray-300 text-center max-w-md">Create your account and manage access securely</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1F232A]">Create Account</h2>
            <p className="text-[#404857] mt-1">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F232A] mb-1">First Name</label>
                <Input placeholder="John" error={errors.firstName?.message} {...register('firstName')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F232A] mb-1">Last Name</label>
                <Input placeholder="Doe" error={errors.lastName?.message} {...register('lastName')} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F232A] mb-1">Email</label>
              <Input type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F232A] mb-1">Password</label>
              <Input type="password" placeholder="Min 8 characters" error={errors.password?.message} {...register('password')} />
            </div>

            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.root.message}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>Create Account</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#404857]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#FD5E2B] hover:underline font-medium">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}