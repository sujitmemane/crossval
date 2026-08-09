import User, { IUser } from "./user.model";

export const createUser = async (user: IUser) => {
    return await User.create(user);
};

export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email });
};

export const findUserById = async (id: string, organizationId: string) => {
    return await User.findOne({ _id: id, organizationId });
};

export const findUserByIdUnscoped = async (id: string) => {
    return await User.findById(id);
};


export const findUserByResetPasswordToken = async (token: string,date: Date) => {
    return await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: date } });
};

export const findUsersByOrganization = async (
    organizationId: string,
    filters: { role?: IUser['role']; page: number; limit: number }
) => {
    const query: Record<string, unknown> = { organizationId };
    if (filters.role) query.role = filters.role;

    const skip = (filters.page - 1) * filters.limit;
    const [users, total] = await Promise.all([
        User.find(query).skip(skip).limit(filters.limit),
        User.countDocuments(query),
    ]);

    return { users, total };
};

export const updateUserById = async (id: string, organizationId: string, updates: Partial<Pick<IUser, 'name' | 'email' | 'role' | 'password'>>) => {
    return await User.findOneAndUpdate({ _id: id, organizationId }, updates, { new: true });
};

export const updateUserByIdUnscoped = async (id: string, updates: Partial<Pick<IUser, 'name' | 'email' | 'password'>>) => {
    return await User.findByIdAndUpdate(id, updates, { new: true });
};