import { Role } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            role: Role;
            handle: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        role: Role;
        handle: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role;
        handle: string | null;
    }
}
