import { pgTable, uuid, varchar, boolean, text, timestamp} from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),

    fistName:varchar('first_name', {length:50}).notNull(),
    lastName: varchar('last_name',{length:50}),       //can be not null
    
    email:varchar('email',{length:322 }).notNull().unique(),     //always keep length 320 but for safer length Buffer we toopk 322
    emailVerified:boolean('email_verified').default(false).notNull(),

    password: varchar('password',{length:66}),
    salt: text('salt'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(()=>new Date()),
})

//ORM - JS (camelCase) but in DB snake_case
// here in our application it is 'firstName'
//  but in DB it will make it 'first_name' bcz it is a mapper