"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, LoginInput } from "@/lib/schemas";
import { useAuth } from "@/context/AuthContext";
import { Button, Input } from "@/components/ui";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      await login(data.email, data.password);
    } catch (error: unknown) {
      const err = error as Error;
      setError("root", { message: err.message || "Invalid credentials" });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .slide-in-right {
          animation: slideInFromRight 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>

      <div className="h-screen max-w-360 flex">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white ">
          <div className="w-full max-w-md shadow-md rounded-2xl border-10 border-[#00000005] pb-5">
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900">RBAC System</h1>
            </div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Sign In</h2>
              <p className="text-gray-500 mt-1">
                Enter your credentials to continue
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 ">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="admin@system.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>
              {errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errors.root.message}
                </div>
              )}
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Sign In
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-orange-500 hover:underline font-medium"
                >
                  Create Account
                </Link>
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Demo: admin@system.com / Admin@123
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Decorative */}
        <div className="hidden lg:flex justify-center items-center mt-4 rounded-2xl lg:w-1/2 bg-gray-900 relative overflow-hidden h-[95vh]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
          </div>
          <div className="relative bg-[url('/rightbackgorund.png')] max-h-screen bg-no-repeat bg-cover z-10 flex flex-col items-end justify-center w-full text-white   aspect-34/41 overflow-hidden">
            <Image
              src={"/overloy.png"}
              alt=""
              width={330}
              height={600}
              className="aspect-11/20  slide-in-right"
            />
          </div>
        </div>
      </div>
    </>
  );
}
