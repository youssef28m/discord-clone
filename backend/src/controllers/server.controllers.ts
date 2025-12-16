import type { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { errorHandler } from "../middleware/errorHandler.js";

interface CreateServerRequestBody {
    name: string;
}


export async function createServer(req: Request<{}, {}, CreateServerRequestBody>, res: Response, next: NextFunction) {
    try {

        const { name } = req.body;
        const userId = req.user!.id;

        if (!name) {
            return errorHandler(new AppError("Server name is required", 400, "BAD_REQUEST"), req, res, next);
        }

        const existingServer = await prisma.servers.findFirst({
            where: {
                name,
                owner_id: userId
            }
        });

        if (existingServer) {
            return errorHandler(new AppError("You already own a server with this name", 409, "CONFLICT"), req, res, next);
        }

        const server = await prisma.servers.create({
            data: {
                name,
                owner_id: userId,
                serverMembers: {
                    create: {
                        user_id: userId,
                        role: "ADMIN"
                    }
                }
            }
        });


        res.status(201).json({
            success: true,
            message: "Server created successfully",
            data: server
        });

    } catch (error) {
        next(error);
    }
}

export async function getServer(req: Request, res: Response, next: NextFunction) {
    try {
        const serverId = req.params.id;
        const userId = req.user!.id;

        const server = await prisma.servers.findUnique({
            where: { id: serverId },
            include: {
                serverMembers: {
                    where: { user_id: userId }
                }
            }
        });

        if (!server) {
            return errorHandler(new AppError("Server not found", 404, "NOT_FOUND"), req, res, next);
        }

        if (server.serverMembers.length === 0) {
            return errorHandler(new AppError("Unauthorized to access this server", 403, "FORBIDDEN"), req, res, next);
        }

        res.status(200).json({
            success: true,
            message: "Server fetched successfully",
            data: server
        });
    } catch (error) {
        next(error);
    }
}

export async function getAllServers(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const servers = await prisma.servers.findMany({
            where: {
                serverMembers: {  
                    some: { user_id: userId }
                }
            }
        });

        if (servers.length === 0) {
            return errorHandler(new AppError("No servers found for this user", 404, "NOT_FOUND"), req, res, next);
        }

        res.status(200).json({
            success: true,
            message: "Servers fetched successfully",
            data: servers
        });

    } catch (error) {
        next(error);
    }
}

export async function getServerMembers(req: Request, res: Response, next: NextFunction) {
    try {

        const serverId = req.params.id;
        const userId = req.user!.id;

        const server = await prisma.servers.findUnique({
            select: {
                id: true
            },
            where: {
                id: serverId
            }
        })

        if (!server) {
            return errorHandler(new AppError("Server not found", 404, "NOT_FOUND"), req, res, next);
        }


        const members = await prisma.server_members.findMany({
            where: {
                server_id: serverId
            },
            select: {
                role: true,
                user: {
                    select: {
                        username: true,
                        id: true,
                        presence: { select: { status: true,} }
                    }
                }
            }
        });


        if (members.length === 0) {
            return errorHandler(new AppError("No members found for this server", 404, "NOT_FOUND"), req, res, next);
        }

        const userInServer = members.find(member => member.user.id === userId);
        
        if (!userInServer) {
            return errorHandler(new AppError("Unauthorized to access this server's members", 403, "FORBIDDEN"), req, res, next);
        }
        
        const result = members.map(m => ({
            id: m.user.id,
            username: m.user.username,
            status: m.user.presence?.status ?? "offline"
        }));

        res.status(200).json({
            success: true,
            message: "Server members retrieved successfully",
            data: result
        });

    } catch (error) {
        next(error);
    }
}

