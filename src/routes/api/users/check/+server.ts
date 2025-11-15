import type { RequestHandler } from "@sveltejs/kit";
import { getUserFromEmail, addUser } from "$lib/server/db";

export const GET: RequestHandler = async ({ url }) => {
    // this will check if the user exists and if not make an account
    const email: String = 'test@hackclub.com' // this will have to get the email from auth
    const user_permission_level: Number = 0 // Why do we need a var for this? Because .run was getting mad, you can remove it
    
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