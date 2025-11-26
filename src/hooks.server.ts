// src/hooks.server.ts
import { SvelteKitAuth } from '@auth/sveltekit';
import type { User } from '@auth/core/types';
import { AUTH_SECRET } from '$env/static/private';

const HackClubProvider = {
  id: 'hackclub',
  name: 'Hack Club',
  type: 'oauth' as const,
  version: '2.0',
  clientId: process.env.HACKCLUB_CLIENT_ID!,
  clientSecret: process.env.HACKCLUB_CLIENT_SECRET!,
  authorization: {
    url: 'https://account.hackclub.com/oauth/authorize',
    params: { scope: 'email name' },
  },
  token: 'https://account.hackclub.com/oauth/token',
  userinfo: 'https://account.hackclub.com/api/v1/me',
  async profile(profile: any): Promise<User> {
    // Map Hack Club profile to Auth.js user
    console.log('Hack Club profile callback:', profile);
    return {
      id: profile.identity.id,
      name: `${profile.identity.first_name} ${profile.identity.last_name}`,
      email: profile.identity.primary_email,
    };
  },
};

export const { handle } = SvelteKitAuth({
  secret: AUTH_SECRET,
  providers: [HackClubProvider as any],
  trustHost: true,
  callbacks: {
    async jwt({ token, account }) {
      // Populate token on first login
      if (account?.provider === 'hackclub' && account.access_token) {
        try {
          const res = await fetch('https://account.hackclub.com/api/v1/me', {
            headers: { Authorization: `Bearer ${account.access_token}` },
          });
          const profile = await res.json();
          console.log('Hack Club /me response:', profile);

          token.email = profile.identity.primary_email;
          token.name = `${profile.identity.first_name} ${profile.identity.last_name}`;
          token.id = profile.identity.id;
        } catch (err) {
          console.error('Error fetching Hack Club profile:', err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure session.user is always populated
      session.user = session.user ?? {};
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.id = token.id as string;
      return session;
    },
  },
});
