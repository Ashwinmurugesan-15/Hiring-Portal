import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Here you can check if the user exists in your database
            // and allow/deny sign in.
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                // Map Google data to internal user structure if needed
                // session.user.role = 'user'; 
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
});

export { handler as GET, handler as POST };
