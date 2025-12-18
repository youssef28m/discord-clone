import type { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { generatInviteCode } from "../services/invite.service.js";

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

        if (!serverId) {
            return errorHandler(new AppError("Server ID is required", 400, "BAD_REQUEST"), req, res, next);
        }

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

        const serverId = req.params.serverId;
        const userId = req.user!.id;


        console.log("Fetching members for server ID:", serverId);

        if (!serverId) {
            return errorHandler(new AppError("Server ID is required", 400, "BAD_REQUEST"), req, res, next);
        }

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
                        presence: { select: { status: true, } }
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

//---------------------------------------------------------------------------//
// Invite a user to a server
//---------------------------------------------------------------------------//

export async function inviteToServer(req: Request, res: Response, next: NextFunction) {
    try {
        // Implementation for inviting a user to a server
        const serverId = req.params.serverId;
        const userId = req.user!.id;

        const server = await prisma.servers.findUnique({
            where: {
                id: serverId
            }
        })

        if (!server) {
            return errorHandler(new AppError("Server not found", 404, "NOT_FOUND"), req, res, next);
        }

        const members = await prisma.server_members.findFirst({
            select: {
                user_id: true
            },
            where: {
                server_id: serverId,
                user_id: userId
            }
        });

        if (!members) {
            return errorHandler(new AppError("Unauthorized to invite users to this server", 403, "FORBIDDEN"), req, res, next);
        }

        const inviteCode = await generatInviteCode(); 

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        await prisma.invites.create({
            data: {
                server_id: serverId,
                code: inviteCode,
                expiresAt: expiresAt
            }
        });

        res.status(201).json({
            success: true,
            message: "Invite created successfully",
            data: { inviteCode, expiresAt }
        });


    } catch (error) {
        next(error);
    }
}

export async function acceptServerInvite(req: Request, res: Response, next: NextFunction) {
    try {
        // Implementation for accepting a server invite
        const { inviteCode } = req.params;
        const userId = req.user!.id;

        const invite = await prisma.invites.findUnique({
            where: {
                code: inviteCode
            }
        });

        if (!invite) {
            return errorHandler(new AppError("Invalid invite code", 404, "NOT_FOUND"), req, res, next);
        }

        if (invite.expiresAt < new Date()) {
            return errorHandler(new AppError("Invite code has expired", 400, "BAD_REQUEST"), req, res, next);
        }

        const existingMember = await prisma.server_members.findFirst({
            where: {
                server_id: invite.server_id,
                user_id: userId
            }
        });

        if (existingMember) {
            return errorHandler(new AppError("Already a member of this server", 400, "BAD_REQUEST"), req, res, next);
        }

        await prisma.invites.delete({
            where: {
                code: inviteCode
            }
        });

        await prisma.server_members.create({
            data: {
                server_id: invite.server_id,
                user_id: userId,
                role: "MEMBER"
            }
        });

        res.status(200).json({
            success: true,
            message: "Successfully joined the server",
            data: null
        });


    } catch (error) {
        next(error);
    }
}