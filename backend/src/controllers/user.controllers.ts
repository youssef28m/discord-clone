
import type {NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { errorHandler } from "../middleware/errorHandler.js";


export async function getUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json({
            "success": true,
            "message": "Users fetched successfully",
            "data": users
        });
    } catch (error) {
        next(error);
    }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
    try {
        const { username ,email, password } = req.body;

        if (!username || !email || !password) {
            return errorHandler(new AppError("Username, email and password are required", 400, "BAD_REQUEST"), req, res, next);
        }

        const findUser = await prisma.user.findUnique({ where: { username } });
        if (findUser) {
            return errorHandler(new AppError("Username already exists", 409, "CONFLICT"), req, res, next);
        }

        if (password.length < 6) {
            return errorHandler(new AppError("Password must be at least 6 characters long", 400, "BAD_REQUEST"), req, res, next);
        }

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password
            }
        });

        res.status(201).json({
            "success": true,
            "message": "User signed up successfully",
            "data": newUser
        });

    }catch (error) {
        next(error);
    }
}
