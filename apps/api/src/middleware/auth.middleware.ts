import {Request,Response,NextFunction} from "express"
import { AppError } from "../lib/errors";
import { verifyAccessToken } from "../modules/auth/auth.utils";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication token missing', 401);
  }

  const result = await verifyAccessToken(token);
  if (!result) {
    throw new AppError('Invalid or expired access token', 401);
  }

  req.user = result;

  next();
};
