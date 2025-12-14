import { Router } from "express";

const serversRouter = Router();

// Define your server-related routes here
serversRouter.get("/", (req, res) => {
    res.send("List of servers");
});


export default serversRouter;