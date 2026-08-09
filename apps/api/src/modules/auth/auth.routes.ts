import { Router } from 'express';
import {
    signup,
    signin,
    refreshToken,
    verifyToken,
    forgotPassword,
    resetPassword,
} from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import {
    signupSchema,
    signinSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from './auth.validate';

const authRouter = Router();

authRouter.post('/sign-up', validate(signupSchema), signup);
authRouter.post('/sign-in', validate(signinSchema), signin);
authRouter.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
authRouter.post('/verify-token', verifyToken);
authRouter.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
authRouter.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default authRouter;
