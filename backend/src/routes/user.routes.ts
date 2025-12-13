
import { Router } from "express";
import { getUser, login, signup, updateUser, deleteUser } from "../controllers/user.controllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const usersRouter = Router();


usersRouter.post("/signup", signup);

usersRouter.post("/login", login);

usersRouter.get("/me", authenticateToken, getUser);

usersRouter.patch("/me", authenticateToken, updateUser);

usersRouter.delete("/me", authenticateToken, deleteUser);



export default usersRouter;