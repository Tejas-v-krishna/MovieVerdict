import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/db"
import { verifyPassword } from "@/lib/auth-helpers"
import type { Role } from "@prisma/client"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isValid = await verifyPassword(
                    credentials.password as string,
                    user.password
                );

                if (!isValid) {
                    return null;
                }

                // Enforce email verification
                if (!user.emailVerified) {
                    throw new Error("Please verify your email before logging in.");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    handle: user.handle,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role as Role;
                token.handle = user.handle as string | null;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as Role;
                session.user.handle = token.handle as string | null;
            }
            return session;
        },
    },
    events: {
        async createUser({ user }) {
            await prisma.reviewerProfile.create({
                data: {
                    userId: user.id!,
                    displayName: user.name || "Reviewer",
                },
            });
        },
    },
    debug: true, // Enable debugging to see errors in logs
});
