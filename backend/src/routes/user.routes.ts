
import { Router } from "express";
import { getUsers, signup } from "../controllers/user.controllers.js";

const usersRouter = Router();

usersRouter.get("/", getUsers)

usersRouter.post("/signup", signup);

usersRouter.post("/login", (req, res) => {
    // Login logic here
    res.send("User logged in");
});



export default usersRouter;