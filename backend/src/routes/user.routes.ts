
import { Router } from "express";
import { getUser, updateUser, deleteUser } from "../controllers/user.controllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const usersRouter = Router();



usersRouter.get("/me", authenticateToken, getUser);

usersRouter.patch("/me", authenticateToken, updateUser);

usersRouter.delete("/me", authenticateToken, deleteUser);



export default usersRouter;