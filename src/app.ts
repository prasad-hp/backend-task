import express, { Request, Response } from "express";
import cors from "cors";
import mainRouter from "./routes/index";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Contact Database. Please navigate to /api/v1/identify");
});

app.use("/api/v1", (req, res, next) => {
  console.log("API v1 route hit");
  next();
}, mainRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
