import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/core/providers/github";

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: "read:user user:email" } }
    })
  ],
  trustHost: true
});