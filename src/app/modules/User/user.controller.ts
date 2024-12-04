import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";


const userRegister = catchAsync(async (req, res) => {

    const result = await UserServices.createUserIntoDB(req.body);

    res.status(httpStatus.OK).json({
        tokens: {
            refresh: result.refreshToken,
            access: result.accessToken
        },
        user: result.result
    })

});


const getUserByToken = catchAsync(async (req, res) => {

    const bearerToken = req.headers.authorization;

    const token = bearerToken?.split(' ')[1];

    const result = await UserServices.getUserFromDbByToken(token as string);

    res.status(httpStatus.OK).json({
        tokens: {
            refresh: result.refreshToken,
            access: result.accessToken
        },
        user: result.remainingData
    })
});


const refreshToken = catchAsync(async (req, res) => {

    const { refresh } = req.body;

    const result = await UserServices.getTokenByrefreshToken(refresh as string);

    res.status(httpStatus.OK).json({
        access: result.accessToken,
        refresh: result.refreshToken,
    })
});


const userLogin = catchAsync(async (req, res) => {

    const result = await UserServices.loginUser(req.body);

    res.status(httpStatus.OK).json({
        tokens: {
            refresh: result.refreshToken,
            access: result.accessToken
        },
        user: result.remainingData
    })
});




export const UserControllers = {
    userRegister,
    getUserByToken,
    refreshToken,
    userLogin,
}