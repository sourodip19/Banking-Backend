import accountModel from "../models/account.model.js";
export const createAccount = async (req, res, next) => {
  try {
    const user = req.user;
    const account = await accountModel.create({
      user: user._id,
      name: user.name,
    });
    res.status(201).json({ message: "Account created successfully", account });
  } catch (error) {
    next(error);
  }
};

export const getAllAccounts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const account = await accountModel.find({ user: userId });
    if (!account) {
      return res.status(404).json({ message: "No account created yet" });
    }
    return res.status(200).json({ account });
  } catch (error) {
    return next(error);
  }
};

export const getAccountBalance = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { accountId } = req.params;
    const account = await accountModel.findOne({
      _id: accountId,
      user: userId,
    });
    if (!account) {
      const error = new Error("You can not check someone else balance");
      error.statusCode = 403;
      return next(error);
    }
    const balance = await account.getBalance();
    res.status(200).json({
      accountId: account._id,
      name: account.name,
      balance: balance,
    });
  } catch (error) {
    return next(error);
  }
};
