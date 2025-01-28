import express from 'express';
import validateRequest from '../../middlewares/validateRequests';
import userAuth from '../../middlewares/userAuth';
import { OrderControllers } from './order.controller';
import adminAuth from '../../middlewares/adminAuth';
import { adminType } from '../../utils/globalTypes';



const router = express.Router();


router.post('/',
    userAuth(),
    OrderControllers.createOrder);


router.get('/', userAuth(), OrderControllers.getAllOrderByUser);

router.get('/get_all_order', adminAuth({
    is_staff: true,
    is_superuser: false
}), OrderControllers.getAllOrder);

router.post('/process',
    OrderControllers.receiveSSLCommerzResponse);








export const OrderRoutes = router;