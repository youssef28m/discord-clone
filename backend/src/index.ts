import express  from "express"
import { errorHandler } from "./middleware/errorHandler.js";
import usersRouter from "./routes/user.routes.js";


const app = express();
const port = process.env.PORT ?? "9001";

app.use(express.json());
app.use("/api/users", usersRouter)
app.use(errorHandler);

app.listen(port, () => {
    console.log(`listening on  http://localhost:${port}`);
})

