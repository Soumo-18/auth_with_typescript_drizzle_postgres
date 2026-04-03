import type { Response } from "express";
import { success } from "zod";

export class ApiResponse {
    static ok<T>(res:Response, message:string, data:T | null = null){
        return res.status(200).json({
            success:true,
            message,
            data,
        })
    }

    static created<T>(res:Response, message: string, data: T | null = null){
        return res.status(201).json({
            success:true,
            message,
            data,
        })
    }
    static noContent<T>(res:Response){
        return res.status(204).send()
    }
}