import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { createServer, getServer , getAllServers, getServerMembers, inviteToServer } from "../controllers/server.controllers.js";
import { server } from "typescript";

const serversRouter = Router();

// Define your server-related routes here
serversRouter.post("/", authenticateToken, createServer);
serversRouter.get("/:id", authenticateToken, getServer);
serversRouter.get("/", authenticateToken, getAllServers);
serversRouter.get("/:id/members", authenticateToken, getServerMembers);
serversRouter.post("/:serverId/invite", authenticateToken, inviteToServer);


export default serversRouter;