
import { Router } from "express";
import { getUsers, login, signup } from "../controllers/user.controllers.js";

const usersRouter = Router();

usersRouter.get("/", getUsers)

usersRouter.post("/signup", signup);

usersRouter.post("/login", login);



export default usersRouter;