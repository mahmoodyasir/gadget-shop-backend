import express from 'express';
import validateRequest from '../../middlewares/validateRequests';
import { UserValidation } from './user.validation';
import { UserControllers } from './user.controller';


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



export const UserRoutes = router;