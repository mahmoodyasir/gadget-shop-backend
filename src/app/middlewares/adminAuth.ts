import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/AppError";
import httpStatus from "http-status";
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from "../config";
import { User } from "../modules/User/user.model";
import { adminType } from "../utils/globalTypes";


const adminAuth = (role: adminType) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {

        const bearerToken = req.headers.authorization;

        const token = bearerToken?.split(' ')[1];

        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
        }


        const decoded = jwt.verify(
            token,
            config.jwt_access_secret as string,
        ) as JwtPayload;


        const { email, id, is_staff, is_superuser } = decoded;

        const user = await User.isUserExistsByEmail(email);

        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, 'User Not Found !');
        }

        if (is_superuser === false && is_staff === false) {
            throw new AppError(httpStatus.NOT_FOUND, 'You are not Permitted !');
        }

        if (role?.is_superuser === true && is_superuser !== true) {
            throw new AppError(httpStatus.NOT_FOUND, 'You are not Superuser !');
        }

        else if (role?.is_staff === true && is_staff !== true) {
            throw new AppError(httpStatus.NOT_FOUND, 'You are not staff user !');
        }

        req.user = decoded as JwtPayload;

        next();

    })
};

export default adminAuth;