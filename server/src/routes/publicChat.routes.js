import express from "express";
import { publicChatHandler } from "../controllers/publicChat.controller.js";

const publicChatRouter = express.Router();

publicChatRouter.post("/", publicChatHandler);

export default publicChatRouter;