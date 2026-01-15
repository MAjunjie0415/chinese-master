import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../lib/drizzle';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';

async function checkUser() {
    const email = 'mozhonglvzhou@gmail.com';
    console.log(`Checking user: ${email}`);

    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (user) {
        console.log('User found in database:', JSON.stringify(user, null, 2));
    } else {
        console.log('User NOT found in database table "users"');
    }
}

checkUser().catch(console.error);
