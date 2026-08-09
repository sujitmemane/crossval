import { TokenPayload } from '../modules/auth/auth.utils';

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export {};
