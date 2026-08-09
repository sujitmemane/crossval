import { Router } from 'express';
import {
    getMe,
    updateMe,
    changePassword,
    getUsers,
    getUser,
    createUser,
    updateUser,
} from './user.controller';
import { authenticate, requireOrganization, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
    updateProfileSchema,
    changePasswordSchema,
    createUserSchema,
    updateUserSchema,
    getUsersSchema,
} from './user.schema';

const userRouter = Router();

userRouter.get('/me', authenticate, getMe);
userRouter.patch('/me', authenticate, validate(updateProfileSchema), updateMe);
userRouter.patch('/me/password', authenticate, validate(changePasswordSchema), changePassword);

userRouter.get('/', authenticate, requireOrganization, requireRole('ADMIN'), validate(getUsersSchema, 'query'), getUsers);
userRouter.get('/:id', authenticate, requireOrganization, requireRole('ADMIN'), getUser);
userRouter.post('/', authenticate, requireOrganization, requireRole('ADMIN'), validate(createUserSchema), createUser);
userRouter.patch('/:id', authenticate, requireOrganization, requireRole('ADMIN'), validate(updateUserSchema), updateUser);

export default userRouter;
