"use client";
import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 15}; SameSite=Lax`;
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError((err as Error).message || "Registration failed");
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">First Name</label>
                <Input placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Last Name</label>
                <Input placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
              <Input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Password</label>
              <Input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
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