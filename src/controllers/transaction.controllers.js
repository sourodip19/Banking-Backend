import transactionModel from "../models/transaction.model.js";
import ledgerModel from "../models/ledger.model.js";
import {
  sendTransactionSuccessEmail,
  sendTransactionFailedEmail,
} from "../services/email.service.js";
import userModel from "../models/user.model.js";
import accountModel from "../models/account.model.js";
import mongoose from "mongoose";
/**
 * Steps to create a new transaction
 * 1. Validate Request
 * 2. Validate the idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create Transaction(Pending)
 * 6. Create Debit ledger entry
 * 7. Create Credit ledger entry
 * 8. Mark Transaction completed
 * 9. commit mongodb session
 * 10. send email notification
 */

export const createTransaction = async (req, res, next) => {
  try {
    const { toAccount, fromAccount, amount, idempotencykey } = req.body;
    if (!toAccount || !fromAccount || !amount || !idempotencykey) {
      const error = new Error(
        "All fields are required to make a valid transaction"
      );
      error.statusCode = 400;
      next(error);
    }
    const user = await userModel.findById({ _id: toAccount });
    if (!user) {
      const error = new Error(
        "A valid user is required to make a valid payment"
      );
      error.statusCode = 400;
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

export const createInitialTransaction = async (req, res, next) => {
  try {
    const { toAccount, amount, idempotencykey } = req.body;
    if (!toAccount || !amount || !idempotencykey) {
      const error = new Error(
        "All fields are required to create the initial fund and make a valid transaction"
      );
      error.statusCode = 400;
      return next(error);
    }
    const toUserAccount = await accountModel.findById(toAccount);
    if (!toUserAccount) {
      const error = new Error(
        "A valid user is required to make a valid payment"
      );
      error.statusCode = 400;
      return next(error);
    }
    const systemUser = await userModel.findOne({
      systemUser: true,
      _id: req.user._id,
    });
    if (!systemUser) {
      const error = new Error("System User account can not found");
      error.statusCode = 404;
      return next(error);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    const transaction = new transactionModel({
      fromAccount: systemUser._id,
      toAccount: toAccount,
      amount: amount,
      idempotencykey: idempotencykey,
      status: "PENDING",
    });
    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: systemUser._id,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session }
    );
    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session }
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({
      message: "Your transaction is successfull",
      transaction: transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};
