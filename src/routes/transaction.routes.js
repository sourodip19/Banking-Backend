import express from "express";
const transactionRouter = express.Router();

/**
 * POST /api/transaction/create
 */
transactionRouter.post('/create',createTransaction);
export default transactionRouter;