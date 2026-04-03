// import type {Request,Response } from 'express'
// import { signinPayloadModel, signupPayloadModel } from './models.js'

// import { db } from '../../db/index.js'
// import { usersTable } from '../../db/schema.js'
// import { eq } from 'drizzle-orm'

// import { createHmac, randomBytes } from 'node:crypto'
// import { createUserToken, UserTokenPayload } from './utils/token.js'


// class AuthenticationController {

//     public async handleSignup(req:Request, res:Response){
//         const validationResult = await signupPayloadModel.safeParseAsync(req.body)
        
//         if(validationResult.error) return res.status(400).json({message:'body validation failed', error: validationResult.error.issues});

//         const { firstName, lastName, email, password} = validationResult.data

//         const userEmailResult = await db.select().from(usersTable).where(eq(usersTable.email, email))
//         //since userEmailResult is showing an array we can either destructure it or
        
//         //check if the length of the array is > 0
//         if(userEmailResult.length>0) return res.status(400).json({error:'Duplicate Entry', message:`User with Email ${email} already exits`});

//         //if doesn't exits we create a user
//         const salt = randomBytes(32).toString('hex') //using this string we'll hash the user's password

//         const hash = createHmac('sha256',salt).update(password).digest('hex')

//        const [result] = await db.insert(usersTable).values({
//             firstName, 
//             lastName,
//             email,
//             password:hash,
//             salt,
//         }).returning({id: usersTable.id})   //.returning() method always returns an Array
//         //const result = await db.insert..., the data inside result looked like this:
//         // It is an array containing an object
//         // [
//         //   { id: 1 } 
//         // ]
//         //Because result is an Array, trying to read result.id threw an error because Arrays do not have an id property (only objects do).
//         // when put [result] -> Array Destructuringthe we can take the  very first item out of the array that Drizzle returns
//             // It is now the object itself!
//             //  { id: 1 }

//         return res.status(201).json({
//             message:'User has been created successfully',
//             data:{ id: result?.id } 
//         })

//     }

//     public async handleSignin( req:Request, res:Response){
//       const validationResult  = await signinPayloadModel.safeParseAsync(req.body)
//       if(validationResult.error) return res.status(400).json({message:'Body Validation Failed', error: validationResult.error.issues});

//       const {email, password } = validationResult.data

//       const [userSelect] =await db.select().from(usersTable).where(eq(usersTable.email, email))
//       if(!userSelect) return res.status(404).json({message:`USer with Email ${email} does not exist`});

//       //if user exists, first match the hash with the user's existing salt 
//       const salt = userSelect.salt!
//       const hash = createHmac('sha256',salt).update(password).digest('hex')

//       if(userSelect.password !== hash) return res.status(400).json({message:`Email or Password is Incorrect`});

//       //if user is valid then make token
//       const token = createUserToken({ id: userSelect.id})
//         return res.json({message:'SignIn Successful', data:{ token }})

      
//     }

//     public async handleMe(req:Request, res:Response){
//         // @ts-ignore
//         const {id}= req.user! as UserTokenPayload

//         const [userResult] = await db.select().from(usersTable).where(eq(usersTable.id, id))

//         return res.json({
//             firstName: userResult?.firstName,
//             lastName:userResult?.lastName,
//             email:userResult?.email,
//         })
//     }
// }

// export default AuthenticationController

import type { Request,Response } from "express";
import { signupPayloadModel , signinPayloadModel } from "./models.js";
import { createUserToken, UserTokenPayload } from "./utils/token.js";
import { generateSalt, hashPassword } from "./utils/hash.js";
import { AuthService } from "./service.js";
import {ApiError} from './utils/ApiError.js'
import { ApiResponse } from "./utils/ApiResponse.js";

class AuthenticationController {
    
    public async handleSignup(req:Request,res:Response){
        //applying dto validating the request body
        const validationResult = await signupPayloadModel.safeParseAsync(req.body)
        //handling dto errors
        if(validationResult.error){
            const err = ApiError.badRequst('Body Validation Failed',validationResult.error.issues)
            return res.status(err.statusCode).json(err)
        }

        const { firstName, lastName, email, password } = validationResult.data

        //checking for existing user via service
        const existingUser= await AuthService.getUserByEmail(email)
        if(existingUser) {
            //using conflict 409 because the resource already exists
            const err = ApiError.conflict(`User with Email ${email} alreadys exists`)
            return res.status(err.statusCode).json(err)
        }
        // Hash password via utility
        const salt = generateSalt()
        const hashedPassword = hashPassword(password, salt)

        //creating user via service
        const result = await AuthService.createUser({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            salt,
        })
        return ApiResponse.created(res, 'User has been created successfully', { id: result?.id})
    }

public async handleSignin (req:Request,res:Response){
    const validatioResult = await signinPayloadModel.safeParseAsync(req.body)
    if(validatioResult.error) {
        const err = ApiError.badRequst('Body Validation Failed', validatioResult.error.issues)
        return res.status(err.statusCode).json(err)
    }

    const {email, password} = validatioResult.data

    //Fetch user via service
    const user = await AuthService.getUserByEmail(email)
    if(!user){
        const err = ApiError.notFound(`User with Email ${email} does not exists`)
        return res.status(err.statusCode).json(err)
    }

    //verify password via utility 
    const hashedInput = hashPassword(password, user.salt!)
    if(user.password !== hashedInput) {
        //using unauthorized 401 for incorrect credentials
        const err = ApiError.unauthorized('Email or Password is Incorrect')
        return res.status(err.statusCode).json()    
    }

    //generate token
    const token = createUserToken({ id: user.id})

    return ApiResponse.ok(res, 'Signin Successful', {token})
    
}

public async handleMe (req:Request, res:Response){
    // @ts-ignore
    const {id} = req.user! as UserTokenPayload
    //fetch user via service
    const user = await AuthService.getUserById(id)
    if(!user){
        const err = ApiError.notFound('User Not Found')
        return res.status(err.statusCode).json(err)
    }

    return ApiResponse.ok(res, 'Profile Fetched Successfully', {
        firstName: user.firstName,
        lastName:user.lastName,
        email:user.email,
    })
}

}

export default AuthenticationController