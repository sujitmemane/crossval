import { Router } from "express";
import { createTransaction, getTransactions } from "./transaction.controller";
import { authenticate, requireOrganization } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createTransactionSchema, getTransactionsSchema } from "./transaction.schema";

const transactionRouter = Router();

transactionRouter.post('/', authenticate, requireOrganization, validate(createTransactionSchema), createTransaction);
transactionRouter.get('/', authenticate, requireOrganization, validate(getTransactionsSchema, 'query'), getTransactions);

export default transactionRouter;
