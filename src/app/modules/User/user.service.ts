import jwt, { JwtPayload } from 'jsonwebtoken';
import config from "../../config";
import { createToken } from "./user.authUtils";
import { IUser, TLogin } from "./user.interface";
import { User } from "./user.model";
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';


const createUserIntoDB = async (payload: Partial<IUser>) => {
    const newUser = await User.create(payload);

    const userObject: IUser = newUser.toObject();

    const jwtPayload = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username || "",
        is_staff: newUser.is_staff || false,
        is_superuser: newUser.is_superuser || false,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string,
    )

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_refresh_expires_in as string,
    )

    const { password, ...result } = userObject;

    const returnResult = {
        accessToken,
        refreshToken,
        result
    }

    return returnResult;

};


const getUserFromDbByToken = async (token: string) => {
    const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
    ) as JwtPayload;

    const { email } = decoded;

    const user: any = await User.isUserExistsByEmail(email);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User Not Found !');
    };

    const jwtPayload = {
        id: user.id,
        email: user.email,
        username: user.username || "",
        is_staff: user.is_staff || false,
        is_superuser: user.is_superuser || false,
    };


    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string,
    )

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_refresh_expires_in as string,
    )

    const userObject = (user as any).toObject();

    const { password, ...remainingData } = userObject;

    const returnResult = {
        accessToken,
        refreshToken,
        remainingData
    }

    return returnResult;

};



const getTokenByrefreshToken = async (refresh_token: string) => {

    const decoded = jwt.verify(
        refresh_token,
        config.jwt_access_secret as string,
    ) as JwtPayload;

    const { email } = decoded;

    const user: any = await User.isUserExistsByEmail(email);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User Not Found !');
    };

    const jwtPayload = {
        id: user.id,
        email: user.email,
        username: user.username || "",
        is_staff: user.is_staff || false,
        is_superuser: user.is_superuser || false,
    };


    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string,
    )

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_refresh_expires_in as string,
    )

    const returnResult = {
        accessToken,
        refreshToken,
    }

    return returnResult;
};



const loginUser = async (payload: TLogin) => {

    const user: any = await User.isUserExistsByEmail(payload.email);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User Not Found !');
    }

    if (!(await User.isPasswordMatched(payload?.password, user?.password)))
        throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');

    const jwtPayload = {
        id: user.id,
        email: user.email,
        username: user.username || "",
        is_staff: user.is_staff || false,
        is_superuser: user.is_superuser || false,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string,
    )

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_refresh_expires_in as string,
    )

    const userObject = (user as any).toObject();

    const { password, ...remainingData } = userObject;

    const returnResult = {
        accessToken,
        refreshToken,
        remainingData
    }

    return returnResult;
};


const updateUserToDB = async (email: string, updatableData: Partial<IUser>) => {

    const updatedUser = await User.findOneAndUpdate(
        { email },
        { $set: updatableData },
        { new: true, runValidators: true }
    );

    const userObject = (updatedUser as any).toObject();

    const { password, ...remainingData } = userObject;

    return remainingData;

}


export const UserServices = {
    createUserIntoDB,
    getUserFromDbByToken,
    getTokenByrefreshToken,
    loginUser,
    updateUserToDB,
}