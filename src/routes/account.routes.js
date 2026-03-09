import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createAccount,
  getAccountBalance,
  getAllAccounts,
} from "../controllers/account.controller.js";
const accountRouter = express.Router();

/**
 * - POST api/account
 * - Create a new account
 * - Protect Route
 */
accountRouter.post("/create", authMiddleware, createAccount);

/**
 * - GET api/account/allAccounts
 * - This api will fetch logged in user's all accounts
 * - Protect Route
 */
accountRouter.get("/allAccounts", authMiddleware, getAllAccounts);

/**
 * - GET api/account/balance/:accountId
 * - This api will fetch user's balance
 * - Protect Route
 */

accountRouter.get('/balance/:accountId',authMiddleware,getAccountBalance);
export default accountRouter;
