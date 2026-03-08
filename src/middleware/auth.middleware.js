import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.Token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      const error = new Error("Token is invalid");
      error.statusCode = 422;
      next(error);
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    req.user = user;
    return next();
  } catch (error) {
    next(error);
  }
};

export const authSystemMiddleware = async (req, res, next) => {
  const token = req.cookies.Token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    const error = new Error("Token not found invalid access");
    error.statusCode = 403;
    next(error);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("+systemUser");
    if (!user.systemUser) {
      const error = new Error("Only a system user can access");
      error.statusCode = 403;
      next(error);
    }
    req.user = user;
    return next();
  } catch (error) {
    next(error);
  }
};
