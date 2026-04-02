import {z} from 'zod'

//helper fucntion to check if a character is a letter
const isLetter =(char:string)=> char.toLowerCase() !=char.toUpperCase()
//to check if a string only has letteres,spaces or hyphens
const isValidName=(val:string)=>{
    return val.split('').every(char=>isLetter(char) || char===' ' || char==='-');

};

//refine method allows to write custom validation logic using standard Js functions.
//We can chain multiple refine() checks together and give the user a 
// specific error message for exactly what they missed

export const signupPayloadModel= z.object({
    firstName:z.string()
    .min(2,{error:"First Name must be at least 2 characters long"})
    .refine(isValidName,{error:'First name can only contain letters, spaces & hyphens'}),

    lastName:z.string()
    .refine(isValidName,{error:'Last Name can only contain letters, spaces & hyphens'})
    .nullable()
    .optional(),

    email:z.email({error:"Please Enter a valid Email address"}),

    password:z.string()
    .min(6,{error:'Password must be at least 6 characters long'})
    .refine((val)=>val.split('').some(c=>isLetter(c) && c=== c.toUpperCase()),
           {
            error:'Password must contain at least one uppercase letter'
           }
    )
    
    .refine((val) => val.split('').some(c => isLetter(c) && c === c.toLowerCase()),
            {
                error:"Password must contain at least one lowercase letter"
            }
    )

    .refine((val)=>val.split('').some(c=> c >= '0' && c <= '9'),
            {
                error:'Password must contain at least one number'
            }    
    )

    .refine((val)=>val.split('').some(c => !isLetter(c) && !(c >='0' && c <='9')),
            {
                 error:'Password must contain at least one special character'
            }
    )

});  














// export const signupPayloadModel = z.object({
//     firstName:z.string().min(2),
//     lastName:z.string().nullable().optional(),
//     email:z.email(),
//     password:z.string().min(6)
// })