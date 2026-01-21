"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signupAction } from "./actions";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignupPage() {
    const [loading, setLoading] = useState(false);

    async function handleGoogleSignIn() {
        setLoading(true);
        await signIn("google", { callbackUrl: "/me" });
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Create your MovieVerdict account</h1>
                    <p className="mt-2 text-muted-foreground">
                        Join the trust-first movie community
                    </p>
                </div>

                <form action={signupAction as any} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-input rounded-md"
                        />
                    </div>

                    <div>
                        <label htmlFor="handle" className="block text-sm font-medium mb-1">
                            Handle (username)
                        </label>
                        <input
                            id="handle"
                            name="handle"
                            type="text"
                            required
                            placeholder="@yourhandle"
                            className="w-full px-3 py-2 border border-input rounded-md"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            This will be your public identifier
                        </p>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={8}
                            className="w-full px-3 py-2 border border-input rounded-md"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            At least 8 characters
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        Create account
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    Sign up with Google
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
