import { getUserFromEmail } from "$lib/server/db";
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  console.log('user accesses /admin')
  const session = await locals.auth();
  const email = session?.user?.email ?? null;
  const user = getUserFromEmail.get({ email });

    if (!email) {
      console.log('user had no email, send to /')
      redirect(302,'/');
    }
    else {
      if (!user || user.is_shop_edit != true) {
        console.log('no access, sending to /home')
        redirect(302,'/home');
      }
    }
    return {}
  };