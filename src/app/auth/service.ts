//this service layer's job is strictly to talk to the db.
import {db} from '../../db/index.js'
import { usersTable } from '../../db/schema.js'
import { eq } from 'drizzle-orm'

export class AuthService {
    public static async getUserByEmail(email:string) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email))
        return user;
    }

    public static async getUserById(id:string) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id))
        return user
    }

    public static async createUser(userData: typeof usersTable.$inferInsert) {
        const [user] = await db.insert(usersTable).values(userData).returning({id: usersTable.id});
        return user
    }
}