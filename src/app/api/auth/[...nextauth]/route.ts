import NextAuth, { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      console.log("[NextAuth] signIn callback called with user:", JSON.stringify(user, null, 2));
      console.log("[NextAuth] user.email:", user.email);
      if (!user.email) {
        console.log("[NextAuth] No email, returning false");
        return false;
      }

      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      console.log("[NextAuth] Existing user:", existing);
      if (!existing) {
        console.log("[NextAuth] Creating new user with email:", user.email);
        await prisma.user.create({
          data: {
            name: user.name || "User",
            email: user.email,
            password: "google-oauth",
            role: "user",
            avatar: user.image || null,
          },
        });
      }
      console.log("[NextAuth] signIn returning true");
      return true;
    },
    async session({ session, token }: { session: any; token: any }) {
      console.log("[NextAuth] session callback called");
      console.log("[NextAuth] session.user:", JSON.stringify(session.user, null, 2));
      console.log("[NextAuth] token.email:", token.email);
      console.log("[NextAuth] token.email type:", typeof token.email);
      if (session.user && typeof token.email === "string") {
        console.log("[NextAuth] Fetching user from DB with email:", token.email);
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        console.log("[NextAuth] dbUser:", dbUser);
        if (dbUser) {
          console.log("[NextAuth] Setting session.user.id to:", dbUser.id);
          session.user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.avatar,
            role: dbUser.role,
          };
        } else {
          console.log("[NextAuth] No dbUser found!");
        }
      } else {
        console.log("[NextAuth] session.user or token.email missing or invalid");
      }
      console.log("[NextAuth] Returning session:", JSON.stringify(session, null, 2));
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      console.log("[NextAuth] jwt callback called");
      console.log("[NextAuth] token:", JSON.stringify(token, null, 2));
      console.log("[NextAuth] user:", JSON.stringify(user, null, 2));
      console.log("[NextAuth] user?.email:", user?.email);
      console.log("[NextAuth] token.email before:", token.email);
      // Always preserve email from token if it exists
      if (user?.email) {
        console.log("[NextAuth] Setting token.email to:", user.email);
        token.email = user.email;
      } else if (token.email) {
        console.log("[NextAuth] Preserving existing token.email:", token.email);
      }
      // Also preserve name and image from user if available
      if (user?.name) {
        token.name = user.name;
      }
      if (user?.image) {
        token.picture = user.image;
      }
      console.log("[NextAuth] token.email after:", token.email);
      console.log("[NextAuth] Returning token:", JSON.stringify(token, null, 2));
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };