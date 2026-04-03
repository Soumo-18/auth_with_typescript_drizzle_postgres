import { createHmac, randomBytes} from 'node:crypto'

export const generateSalt = ():string => randomBytes(32).toString('hex')

export const hashPassword = (password:string, salt:string): string =>{
    return createHmac('sha256', salt).update(password).digest('hex')
}