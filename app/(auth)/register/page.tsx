'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerSchema, RegisterInput } from '@/lib/schemas';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerForm, handleSubmit, setError, formState: { errors } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsSubmitting(true);
      await registerUser(data.email, data.password, data.firstName, data.lastName);
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as Error;
      setError('root', { message: err.message || 'Registration failed' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <h1 className="text-5xl font-bold mb-6">Join Us</h1>
          <p className="text-xl text-gray-300 text-center max-w-md">Create your account and manage access securely</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-1">Fill in your details to get started</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">First Name</label>
                <Input placeholder="John" error={errors.firstName?.message} {...registerForm('firstName')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Last Name</label>
                <Input placeholder="Doe" error={errors.lastName?.message} {...registerForm('lastName')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
              <Input type="email" placeholder="john@example.com" error={errors.email?.message} {...registerForm('email')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Password</label>
              <Input type="password" placeholder="Min 8 characters" error={errors.password?.message} {...registerForm('password')} />
            </div>
            {errors.root && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{errors.root.message}</div>}
            <Button type="submit" className="w-full" isLoading={isSubmitting}>Create Account</Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-500">Already have an account? <Link href="/login" className="text-orange-500 hover:underline font-medium">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}