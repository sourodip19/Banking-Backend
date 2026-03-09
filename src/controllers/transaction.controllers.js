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
  const { toAccount, fromAccount, amount, idempotencykey } = req.body;

  if (!toAccount || !fromAccount || !amount || !idempotencykey) {
    const error = new Error(
      "All fields are required to make a valid transaction"
    );
    error.statusCode = 400;
    return next(error);
  }

  let session;
  let transaction;

  try {
    /**
     * 1️⃣ Fetch accounts
     */
    const toUserAccount = await accountModel.findById(toAccount).lean();
    const fromUserAccount = await accountModel.findById(fromAccount);

    if (!toUserAccount || !fromUserAccount) {
      const error = new Error("Account does not exist");
      error.statusCode = 404;
      return next(error);
    }

    /**
     * 2️⃣ Authorization check
     */
    if (!fromUserAccount.user.equals(req.user._id)) {
      const error = new Error("Unauthorized account access");
      error.statusCode = 403;
      return next(error);
    }

    if (toAccount === fromAccount) {
      const error = new Error("fromAccount and toAccount must be different");
      error.statusCode = 400;
      return next(error);
    }

    /**
     * 3️⃣ Idempotency check
     */
    const existingTransaction = await transactionModel.findOne({
      idempotencykey,
    });

    if (existingTransaction) {
      return res.status(200).json({
        message: `Transaction already ${existingTransaction.status}`,
        transaction: existingTransaction,
      });
    }

    /**
     * 4️⃣ Start MongoDB session
     */
    session = await mongoose.startSession();
    session.startTransaction();

    /**
     * 5️⃣ Recalculate balance INSIDE transaction
     */
    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      throw new Error(`Insufficient balance. Balance: ${balance}`);
    }

    /**
     * 6️⃣ Create transaction (PENDING)
     */
    transaction = new transactionModel({
      fromAccount,
      toAccount,
      amount,
      idempotencykey,
      status: "PENDING",
    });

    /**
     * 7️⃣ Insert ledger entries
     */
    await ledgerModel.create(
      [
        {
          account: fromAccount,
          transaction: transaction._id,
          amount,
          type: "DEBIT",
        },
        {
          account: toAccount,
          transaction: transaction._id,
          amount,
          type: "CREDIT",
        },
      ],
      { session, ordered: true }
    );

    /**
     * 8️⃣ Mark transaction complete
     */
    transaction.status = "COMPLETED";
    await transaction.save({ session });

    /**
     * 9️⃣ Commit transaction
     */
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    return next(error);
  }

  /**
   * 🔟 Send email notification
   */
  try {
    await sendTransactionSuccessEmail(
      req.user.email,
      req.user.name,
      amount,
      toAccount
    );
  } catch (err) {
    console.error("Email failed:", err);
  }

  return res.status(201).json({
    message: `${amount} successfully debited from ${fromAccount}`,
    transaction,
  });
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
