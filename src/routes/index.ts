import express from "express";
import contactRouter from "./contact";

const router = express.Router();

router.use("/identify", contactRouter);

export default router;
