import express  from "express"
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";
import usersRouter from "./routes/user.routes.js";
import serversRouter from "./routes/server.routes.js";
import authRoutes from "./routes/auth.routes.js";


const app = express();
const port = process.env.PORT ?? "9001";

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRouter) 
app.use("/api/servers", serversRouter)
app.use(errorHandler);

app.listen(port, () => {
    console.log(`listening on  http://localhost:${port}`);
})
