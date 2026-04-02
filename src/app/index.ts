import express from 'express'
import type { Express, NextFunction } from 'express'
import {authRouter} from './auth/routes.js'
import { authMiddleware } from './middleware/auth-middleware.js'

export function createApplication() : Express {
    const app = express()

    //Middlewares
    app.use(express.json())
    app.use(authMiddleware()) //this the middleware which runs everytime



    //Routes
    app.get('/', (req,res) =>{
        return res.json({message:"Welcome to Chaicode Auth. Service"})
    })

    app.use('/auth', authRouter)

    return app
}
