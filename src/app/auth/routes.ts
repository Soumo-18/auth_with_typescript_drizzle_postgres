import express from 'express'

import type {Router} from 'express'

import AuthenticationController from './controller.js'
import { restrictToAuthenticatedUser } from '../middleware/auth-middleware.js'

const authController = new AuthenticationController()

export const authRouter: Router = express.Router()

authRouter.post('/sign-up', authController.handleSignup.bind(authController))

authRouter.post('/sign-in', authController.handleSignin.bind(authController))

authRouter.get('/me', restrictToAuthenticatedUser(), authController.handleMe.bind(authController)) //to access /me route the user needs to be authenticated.We Need a middleware