import type { RequestHandler } from "@sveltejs/kit";
import { getUserFromEmail, addUser } from "$lib/server/db";

export const GET: RequestHandler = async ( event ) => {
    // this will check if the user exists and if not make an account
    const session = await event.locals.auth();

    if (!session || !session.user?.email) {
        return new Response("Unauthorized", { status: 401 });
    }

    const email = session.user.email


    const user_permission_level: Number = 0 // Why do we need a var for this?
    
    console.log('got request for new user');

    var existingUser = getUserFromEmail.get({ email });
    if (existingUser != null) { // Check if user exists
        console.log('user exists')
        return new Response(JSON.stringify({message: 'user exists'}));
    }

    existingUser = null;
    addUser.run(email, user_permission_level);

    console.log('added user');

    return new Response(JSON.stringify({message: 'added user'}))
}