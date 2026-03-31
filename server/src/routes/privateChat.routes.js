import express from "express";
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { privateChatController } from "../controllers/privateChat.controller.js";

const privateChatRouter = express.Router();

privateChatRouter.post("/private", authMiddleware, privateChatController);

export default privateChatRouter;