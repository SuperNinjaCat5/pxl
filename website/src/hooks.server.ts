import { SvelteKitAuth } from "@auth/sveltekit";
import { AUTH_SECRET } from "$env/static/private";
import Slack from "@auth/sveltekit/providers/slack"

export const { handle } = SvelteKitAuth({
  secret: AUTH_SECRET,
  providers: [
    Slack({
      clientId: process.env.AUTH_SLACK_ID!,
      clientSecret: process.env.AUTH_SLACK_SECRET!,
    })
  ],
  trustHost: true,

  callbacks: {
    // optional: run once on sign in to pick a verified email
    async signIn({ account }) {
      if (account?.provider !== "github" || !account.access_token) return true;

      const resp = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${account.access_token}` }
      });
      const emails: { email:string; primary:boolean; verified:boolean }[] = await resp.json();

      const primaryVerified =
        emails.find(e => e.primary && e.verified) ??
        emails.find(e => e.verified) ??
        null;

      // require a verified email (optional but recommended)
      if (!primaryVerified) return false;

      // stash it on the account temporarily so we can copy to the token
      // @ts-ignore - not in the type, but available here
      account.__chosenEmail = primaryVerified.email;
      return true;
    },

    async jwt({ token, account }) {
      // on first login, copy chosen email onto the token
      // @ts-ignore - custom field from signIn above
      if (account?.__chosenEmail) token.email = account.__chosenEmail;
      return token;
    },

    async session({ session, token }) {
      if (token?.email) session.user.email = token.email as string;
      return session;
    }
  }
});
