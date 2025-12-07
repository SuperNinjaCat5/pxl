import { SvelteKitAuth } from '@auth/sveltekit';
import type { User } from '@auth/core/types';
import { AUTH_SECRET } from '$env/static/private';
import { addUser } from '$lib/server/db';
//const allowedEmails: string[] = ['ben.elliott.2021@gmail.com', 'web@niiccoo2.xyz'];

const HackClubProvider = {
	id: 'hackclub',
	name: 'Hack Club',
	type: 'oauth' as const,
	version: '2.0',
	clientId: process.env.HACKCLUB_CLIENT_ID!,
	clientSecret: process.env.HACKCLUB_CLIENT_SECRET!,
	authorization: {
		url: 'https://account.hackclub.com/oauth/authorize',
		params: { scope: 'email name' }
	},
	token: 'https://account.hackclub.com/oauth/token',
	userinfo: 'https://account.hackclub.com/api/v1/me',
	async profile(profile: any): Promise<User> {
		return {
			id: profile.identity.id,
			name: `${profile.identity.first_name} ${profile.identity.last_name}`,
			email: profile.identity.primary_email
		};
	}
};

export const { handle } = SvelteKitAuth({
	secret: AUTH_SECRET,
	providers: [HackClubProvider as any],
	trustHost: true,
	callbacks: {
		async jwt({ token, account }) {
			if (account?.provider === 'hackclub' && account.access_token) {
				try {
					const res = await fetch('https://account.hackclub.com/api/v1/me', {
						headers: { Authorization: `Bearer ${account.access_token}` }
					});
					const profile = await res.json();

					token.email = profile.identity.primary_email;
					token.name = `${profile.identity.first_name} ${profile.identity.last_name}`;
					token.id = profile.identity.id;
					token.slack_id = profile.identity.slack_id;
					//if (!allowedEmails.includes(token.email?)) {console.log('not allowed');return null;};
					//if (typeof token.email === 'string' && allowedEmails.includes(token.email)) {
					try {
						addUser.run({ email: token.email, slack_id: token.slack_id });
					} catch (err: any) {
						if (!err.message.includes('UNIQUE constraint failed')) {
							console.error('DB insert error:', err);
						}
					}
					//} else {
					//	return null;
					//}
				} catch (err) {
					console.error('Error fetching Hack Club profile:', err);
				}
			}
			return token;
		},
		async session({ session, token }) {
			session.user = session.user ?? {};
			session.user.email = token.email as string;
			session.user.name = token.name as string;
			session.user.id = token.id as string;
			session.user.slack_id = token.slack_id as string;
			return session;
		}
	}
});
