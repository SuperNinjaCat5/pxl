import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth();

  const allowed_emails = ["ben.elliott.2021@gmail.com","web@niiccoo2.xyz"];
  const email = session?.user?.email ?? null;

    if (!email) {
      redirect(302,'/');
    }
    else {
      if (!allowed_emails.includes(email)) {
        redirect(302,'/account');
      }
    }
    return {}
  };