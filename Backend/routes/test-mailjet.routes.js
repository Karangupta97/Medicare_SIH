import express from "express";
import { testMailjetEmail } from "../controllers/testMailjet.controller.js";

const router = express.Router();

router.post("/", testMailjetEmail);

export default router;
