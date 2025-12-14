
import type {NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { errorHandler } from "../middleware/errorHandler.js";
import bcrypt from "bcryptjs";


interface UpdateUserRequestBody {
    username?: string;
    email?: string;
    password?: string;
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req.params as { id?: string }).id || req.user!.id;

        if (userId !== req.user!.id) {
            return errorHandler(new AppError("Unauthorized to access this user", 403, "FORBIDDEN"), req, res, next);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, createdAt: true }
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

        const { username, email, password } = req.body;

        const updateData: any = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (password) {
            if (password.length < 6) {
                return errorHandler(new AppError("Password must be at least 6 characters long", 400, "BAD_REQUEST"), req, res, next);
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, username: true, email: true, createdAt: true }
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
