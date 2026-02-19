import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "select_account", // Forces account selection screen
                }
            }
        }),
        CredentialsProvider({
            name: "Demo Login",
            credentials: {
                username: { label: "Username", type: "text" }
            },
            async authorize(credentials) {
                if (credentials?.username === "demo") {
                    return {
                        id: "demo-user",
                        name: "Demo User",
                        email: "demo@hireflow.com",
                        image: null,
                        role: "super_admin"
                    };
                }
                return null;
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
});

export { handler as GET, handler as POST };
