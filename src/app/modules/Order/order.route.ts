import express from 'express';
import validateRequest from '../../middlewares/validateRequests';
import userAuth from '../../middlewares/userAuth';
import { OrderControllers } from './order.controller';



const router = express.Router();

router.post('/',
    userAuth(),
    OrderControllers.createOrder);





export const OrderRoutes = router;