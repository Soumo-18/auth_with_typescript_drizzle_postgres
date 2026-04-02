import type {Request,Response } from 'express'
import { signupPayloadModel } from './models.js'

import { db } from '../../db/index.js'
import { usersTable } from '../../db/schema.js'
import { eq } from 'drizzle-orm'

import { createHmac, randomBytes } from 'node:crypto'

class AuthenticationController {

    public async handleSignup(req:Request, res:Response){
        const validationResult = await signupPayloadModel.safeParseAsync(req.body)
        
        if(validationResult.error) return res.status(400).json({message:'body validation failed', error: validationResult.error.issues});

        const { firstName, lastName, email, password} = validationResult.data

        const userEmailResult = await db.select().from(usersTable).where(eq(usersTable.email, email))
        //since userEmailResult is showing an array we can either destructure it or
        
        //check if the length of the array is > 0
        if(userEmailResult.length>0) return res.status(400).json({error:'Duplicate Entry', message:`User with Email ${email} already exits`});

        //if doesn't exits we create a user
        const salt = randomBytes(32).toString('hex') //using this string we'll hash the user's password

        const hash = createHmac('sha256',salt).update(password).digest('hex')

       const [result] = await db.insert(usersTable).values({
            firstName, 
            lastName,
            email,
            password:hash,
            salt,
        }).returning({id: usersTable.id})   //.returning() method always returns an Array
        //const result = await db.insert..., the data inside result looked like this:
        // It is an array containing an object
        // [
        //   { id: 1 } 
        // ]
        //Because result is an Array, trying to read result.id threw an error because Arrays do not have an id property (only objects do).
        // when put [result] -> Array Destructuringthe we can take the  very first item out of the array that Drizzle returns
            // It is now the object itself!
            //  { id: 1 }

        return res.status(201).json({
            message:'User has been created successfully',
            data:{ id: result?.id } 
        })

    }
}

export default AuthenticationController