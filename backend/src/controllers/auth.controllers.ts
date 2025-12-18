import type {NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { errorHandler } from "../middleware/errorHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateJwtAccessToken, generateJwtRefreshToken } from "../services/token.service.js";


interface SignupRequestBody {
    username: string;
    email: string;
    password: string;
}

interface LoginRequestBody {
    email: string;
    password: string;
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
            return errorHandler(new AppError("Invalid credentials", 401, "UNAUTHORIZED"), req, res, next);
        }

        const token = generateJwtAccessToken(user.id);
        const { refreshToken, jti ,expiresAt} = generateJwtRefreshToken(user.id);

        // store refresh token jti in database
        await prisma.refreshToken.create({
            data: {
                id: jti,
                userId: user.id,
                expiresAt: expiresAt
            }
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(200).json({
            "success": true,
            "message": "User logged in successfully",
            "data": { 
                token,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username
                }
            }
        });

    } catch(error) {
        next(error);
    }
}


export async function refreshToken(req: Request, res: Response, next: NextFunction) {

    try {

        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
            return errorHandler(new AppError("Refresh token is required", 400, "BAD_REQUEST"), req, res, next);
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as jwt.JwtPayload;
        const jti = decoded.jti;
        

        const tokenRecord = await prisma.refreshToken.findUnique({
            where: { id: jti }
        });

    
        if (!tokenRecord) {
            return errorHandler(new AppError("Invalid refresh token", 401, "UNAUTHORIZED"), req, res, next);
        }
    
        if (tokenRecord.expiresAt < new Date()) {
            // Token has expired
            await prisma.refreshToken.delete({ where: { id: jti } }); 
            return errorHandler(new AppError("Refresh token has expired", 401, "UNAUTHORIZED"), req, res, next);
        }

        const newAccessToken = generateJwtAccessToken(tokenRecord.userId);

        res.status(200).json({
            "success": true,
            "message": "Access token refreshed successfully",
            "data": {
                token: newAccessToken
            }
        });
        
    } catch (error) {
        const err = error as Error;
        if (err.name === 'JsonWebTokenError') {
            return errorHandler(new AppError("Invalid refresh token", 401, "UNAUTHORIZED"), req, res, next);
        }
        next(error);
    }

}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
            return errorHandler(new AppError("Refresh token is required", 400, "BAD_REQUEST"), req, res, next);
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as jwt.JwtPayload;
        const jti = decoded.jti;

        await prisma.refreshToken.deleteMany({
            where: { id: jti }
        });

        res.clearCookie('refreshToken', {path: '/api/auth'});

        res.status(200).json({
            "success": true,
            "message": "User logged out successfully"
        });

    } catch (error) {
        next(error);
    }
}

export async function logoutAllSessions(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return errorHandler(new AppError("User not authenticated", 401, "UNAUTHORIZED"), req, res, next);
        }
        await prisma.refreshToken.deleteMany({
            where: { userId }
        });
        res.status(200).json({
            "success": true,
            "message": "User logged out from all sessions successfully"
        });
    } catch (error) {
        next(error);
    }
}