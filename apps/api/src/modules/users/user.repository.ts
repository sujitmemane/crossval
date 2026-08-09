import User, { IUser } from "./user.model";

export const createUser = async (user: IUser) => {
    return await User.create(user);
};

export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email });
};

export const findUserById = async (id: string) => {
    return await User.findById(id);
};  


export const findUserByResetPasswordToken = async (token: string,date: Date) => {
    return await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: date } });
};