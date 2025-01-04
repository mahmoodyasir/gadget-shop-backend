import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import { uploadImageToS3 } from "../../utils/uploadImageToS3";
import path from "path";
import imageUploadQueue from "../../queues/imageUploadQueue";
import config from "../../config";


const userRegister = catchAsync(async (req, res) => {

    const result = await UserServices.createUserIntoDB(req.body);

    res.status(httpStatus.CREATED).json({
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


const updateUser = catchAsync(async (req, res) => {

    const { email } = req.user;

    const data = req.body;

    const imageFile = req.file;

    let image_url = "";

    let updatableData = {}

    if (imageFile) {

        const deleteImageUrl = data?.image_url;

        const file = imageFile as Express.Multer.File;
        const { originalname } = file;
        const fileExtension = path.extname(originalname);
        const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;

        const fileBufferBase64 = file.buffer.toString('base64');
        const folderName = "user";

        if (deleteImageUrl && deleteImageUrl !== "") {
            await imageUploadQueue.add('deleteImage', { imageUrl: deleteImageUrl });
        }

        await imageUploadQueue.add('uploadImage', {
            file: {
                originalname: file.originalname,
                mimetype: file.mimetype,
                buffer: fileBufferBase64,
            },
            fileName: uniqueFilename,
            folderName: folderName,
        });

        image_url = `https://${config.aws_s3_bucket_name}.s3.amazonaws.com/${folderName}/${uniqueFilename}`;


        updatableData = {
            ...data,
            image_url: image_url
        }
    }

    else {
        updatableData = {
            ...data,
        }
    }

    const result = await UserServices.updateUserToDB(email, updatableData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Updated Successfully",
        data: result
    });

})


export const UserControllers = {
    userRegister,
    getUserByToken,
    refreshToken,
    userLogin,
    updateUser,
}