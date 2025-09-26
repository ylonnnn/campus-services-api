import express, { Router } from "express";

const app = express();

app.use(express.json());

// Test Frontend for requests
app.use(express.static("src/test"));

export const AppRouter = Router();
app.use("/api/services/", AppRouter);

export default app;
