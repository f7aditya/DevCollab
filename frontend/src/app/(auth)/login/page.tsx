// @ts-nocheck
"use client";

import * as React from "react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Mail, Linkedin } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we just came back from an OAuth redirect
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");
    const err = searchParams.get("error");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(token, user);
        router.push("/dashboard");
      } catch (e) {
        console.error("Failed to parse user data from URL");
      }
    } else if (err === "oauth_failed") {
      setError("OAuth login failed. Please try again or use email.");
    } else if (err === "invalid_token") {
      setError("Session expired or invalid. Please try again.");
    }
  }, [searchParams, login, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.success && response.data) {
        login(response.data.token, response.data.user);
        router.push("/dashboard");
      }
    } catch (err: any) {
      let errorMessage = "Failed to login. Please try again.";
      if (typeof err === "string") {
        errorMessage = err;
      } else if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

  return (
    <Card className="border-none shadow-xl shadow-black/5 dark:shadow-white/5">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">D</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 mb-4 text-sm text-danger bg-danger/10 rounded-md border border-danger/20">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-2 mb-4">

          <Button variant="outline" type="button" onClick={() => window.location.href = `${API_URL}/auth/oauth/github`} className="w-full">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>

        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                Password
              </label>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In with Email"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
