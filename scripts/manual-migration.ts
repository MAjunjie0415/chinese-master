import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '@/lib/drizzle';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Starting manual migration...');

    try {
        // 1. Create invite_codes table
        console.log('Creating invite_codes table...');
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "invite_codes" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "code" text NOT NULL,
          "generated_by" uuid NOT NULL,
          "is_used" boolean DEFAULT false NOT NULL,
          "used_by" uuid,
          "used_at" timestamp,
          "created_at" timestamp DEFAULT now() NOT NULL,
          CONSTRAINT "invite_codes_code_unique" UNIQUE("code")
      );
    `);

        // 2.1 Add used_at column if missing (for existing tables)
        try {
            await db.execute(sql`ALTER TABLE "invite_codes" ADD COLUMN IF NOT EXISTS "used_at" timestamp;`);
        } catch (e: any) {
            console.warn('Warning: could not add used_at column', e.message);
        }

        // 2. Create user_wishes table
        console.log('Creating user_wishes table...');
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user_wishes" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" uuid NOT NULL,
          "title" text NOT NULL,
          "category" text NOT NULL,
          "description" text,
          "status" text DEFAULT 'pending' NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

        // 3. Add foreign keys
        // We wrap each in a separate try/catch because they might already exist

        console.log('Adding constraints...');

        try {
            await db.execute(sql`ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;`);
        } catch (e: any) {
            if (!e.message.includes('already exists')) console.warn('Warning: invite_codes_generated_by_users_id_fk', e.message);
        }

        try {
            await db.execute(sql`ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_used_by_users_id_fk" FOREIGN KEY ("used_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;`);
        } catch (e: any) {
            if (!e.message.includes('already exists')) console.warn('Warning: invite_codes_used_by_users_id_fk', e.message);
        }

        try {
            await db.execute(sql`ALTER TABLE "user_wishes" ADD CONSTRAINT "user_wishes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;`);
        } catch (e: any) {
            if (!e.message.includes('already exists')) console.warn('Warning: user_wishes_user_id_users_id_fk', e.message);
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

main();
