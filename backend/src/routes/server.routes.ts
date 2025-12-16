import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { createServer, getServer , getAllServers, getServerMembers } from "../controllers/server.controllers.js";

const serversRouter = Router();

// Define your server-related routes here
serversRouter.post("/", authenticateToken, createServer);
serversRouter.get("/:id", authenticateToken, getServer);
serversRouter.get("/", authenticateToken, getAllServers);
serversRouter.get("/:id/members", authenticateToken, getServerMembers);


export default serversRouter;