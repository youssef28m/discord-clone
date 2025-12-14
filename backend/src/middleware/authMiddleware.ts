import type {NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { errorHandler } from "./errorHandler.js";

declare global {
    namespace Express {
        interface Request {
            user?: { id: string };
        }
    }
}

export function authenticateToken (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    const token = authHeader?.split(' ')[1];

    if (!token) {
        return errorHandler(new AppError("Access token is required. Use /refresh to get a new token.", 401, "UNAUTHORIZED"), req, res, next);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        return next(new AppError("Invalid or expired token", 403, "FORBIDDEN"));
    }
}