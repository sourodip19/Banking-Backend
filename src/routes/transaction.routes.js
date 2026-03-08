import express from "express";
import { authMiddleware, authSystemMiddleware } from "../middleware/auth.middleware.js";
import { createInitialTransaction, createTransaction } from "../controllers/transaction.controllers.js";
const transactionRouter = express.Router();

/**
 * POST /api/transaction/create
 */
transactionRouter.post("/create", authMiddleware, createTransaction);
/**
 * POST /api/transaction/system/initial-funds
 * This route can be accessed by the system user to transfer funds to regular user's accounts
 */
transactionRouter.post("/system/initial-funds",authSystemMiddleware,createInitialTransaction);
export default transactionRouter;
