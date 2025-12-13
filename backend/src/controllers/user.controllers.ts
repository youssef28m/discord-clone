
import type {NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { errorHandler } from "../middleware/errorHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


interface SignupRequestBody {
    username: string;
    email: string;
    password: string;
}

interface LoginRequestBody {
    email: string;
    password: string;
}

interface UpdateUserRequestBody {
    username?: string;
    email?: string;
    password?: string;
    status?: string;
}


export async function signup(req: Request<{}, {}, SignupRequestBody> , res: Response, next: NextFunction) {
    try {
        const { username ,email, password } = req.body;

        if (!username || !email || !password) {
            return errorHandler(new AppError("Username, email and password are required", 400, "BAD_REQUEST"), req, res, next);
        }

        
        const findUser = await prisma.user.findUnique({ where: { email } });
        if (findUser) {
            return errorHandler(new AppError("user already exists", 409, "CONFLICT"), req, res, next);
        }
        
        if (password.length < 6) {
            return errorHandler(new AppError("Password must be at least 6 characters long", 400, "BAD_REQUEST"), req, res, next);
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: passwordHash
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


export async function login(req: Request<{}, {}, LoginRequestBody>, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorHandler(new AppError("Email and password are required", 400, "BAD_REQUEST"), req, res, next);
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return errorHandler(new AppError("Invalid credentials", 401, "UNAUTHORIZED"), req, res, next);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return errorHandler(new AppError("invalid credentials", 401, "UNAUTHORIZED"), req, res, next);
        }

        if (!process.env.JWT_SECRET) {
            return errorHandler(new AppError("JWT is not configured", 500, "INTERNAL_SERVER_ERROR"), req, res, next);
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '3d'}
        );

        res.status(200).json({
            "success": true,
            "message": "User logged in successfully",
            "data": { 
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    status: user.status
                }
            }
        });

    } catch(error) {
        next(error);
    }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req.params as { id?: string }).id || req.user!.id;

        if (userId !== req.user!.id) {
            return errorHandler(new AppError("Unauthorized to access this user", 403, "FORBIDDEN"), req, res, next);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, status: true, createdAt: true }
        });

        if (!user) {
            return errorHandler(new AppError("User not found", 404, "NOT_FOUND"), req, res, next);
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
}

export async function updateUser(req: Request<{}, {}, UpdateUserRequestBody>, res: Response, next: NextFunction) {
    try {
        const userId = (req.params as { id?: string }).id || req.user!.id;

        if (userId !== req.user!.id) {
            return errorHandler(new AppError("Unauthorized to update this user", 403, "FORBIDDEN"), req, res, next);
        }

        const { username, email, password, status } = req.body;

        const updateData: any = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (status) updateData.status = status;
        if (password) {
            if (password.length < 6) {
                return errorHandler(new AppError("Password must be at least 6 characters long", 400, "BAD_REQUEST"), req, res, next);
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, username: true, email: true, status: true, createdAt: true }
        });

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'P2025') {
            return errorHandler(new AppError("User not found", 404, "NOT_FOUND"), req, res, next);
        }
        next(error);
    }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req.params as { id?: string }).id || req.user!.id;

        if (userId !== req.user!.id) {
            return errorHandler(new AppError("Unauthorized to delete this user", 403, "FORBIDDEN"), req, res, next);
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'P2025') {
            return errorHandler(new AppError("User not found", 404, "NOT_FOUND"), req, res, next);
        }
        next(error);
    }
}
