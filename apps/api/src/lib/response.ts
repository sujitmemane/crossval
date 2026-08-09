export interface ServiceSuccess<T> {
    success: true;
    message: string;
    data: T;
}

export const success = <T>(message: string, data: T): ServiceSuccess<T> => ({
    success: true,
    message,
    data,
});
