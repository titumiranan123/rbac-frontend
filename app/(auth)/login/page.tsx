"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button, Input } from "@/components/ui";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError((err as Error).message || "Login failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen max-w-360 mx-auto flex items-center">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white ">
        <div className="w-full max-w-md shadow-md rounded-2xl border-10 border-[#00000005] p-5">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Sign In</h2>
            <p className="text-gray-500 mt-1">
              Enter your credentials to continue
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 ">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email
              </label>
              <Input
                type="email"
                placeholder="admin@system.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
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
      <div className="hidden lg:flex justify-center items-center  rounded-2xl lg:w-1/2  relative overflow-hidden h-170 mt-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
        <div
          className="relative overflow-hidden"
          style={{ width: "820px", height: "680px" }}
        >
          {/* Background */}
          <Image
            src="/rightbackgorund.png"
            alt=""
            fill
            className="object-cover z-0"
            priority
          />

          {/* Overlay Image */}
          <Image
            src="/overloy.png"
            alt=""
            width={960}
            height={600}
            className="absolute z-10 border-10 border-[#00000005] animate-slideIn"
            style={{
              width: "100%",
              height: "auto",
              top: "50%",
              left: "50%",
              transform: "translate(-40%, -50%)",
            }}
            priority
          />
        </div>
      </div>
    </div>
  );
}
