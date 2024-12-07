import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/AppError";
import httpStatus from "http-status";
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from "../config";
import { User } from "../modules/User/user.model";


const auth = () => {
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

        const { email } = decoded;

        const user = await User.isUserExistsByEmail(email);

        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, 'User Not Found !');
        }

        req.user = decoded as JwtPayload;

        next();

    })
};

export default auth;