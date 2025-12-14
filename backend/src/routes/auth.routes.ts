import { Router } from "express";
import { signup, login, logout } from "../controllers/auth.controllers.js";
import { refreshToken } from "../controllers/auth.controllers.js";

const authRoutes = Router();

authRoutes.post("/signup", signup);

authRoutes.post("/login", login);

authRoutes.get("/refresh", refreshToken);

authRoutes.post("/logout", logout);




export default authRoutes;