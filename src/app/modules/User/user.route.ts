import express from 'express';
import validateRequest from '../../middlewares/validateRequests';
import { UserValidation } from './user.validation';
import { UserControllers } from './user.controller';
import upload from '../../middlewares/upload';
import userAuth from '../../middlewares/userAuth';


const router = express.Router();

router.post('/register',
    validateRequest(UserValidation.userValidationSchema),
    UserControllers.userRegister);

router.post('/token/refresh',
    validateRequest(UserValidation.refreshTokenValidation),
    UserControllers.refreshToken);

router.get('/get_user', UserControllers.getUserByToken);

router.post('/login',
    validateRequest(UserValidation.loginDataValidationSchema),
    UserControllers.userLogin);

router.put('/update_user',
    userAuth(),
    upload.single('image'),
    UserControllers.updateUser);



export const UserRoutes = router;