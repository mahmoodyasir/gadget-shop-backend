import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { ProductRoutes } from '../modules/Product/product.route';
import { OrderRoutes } from '../modules/Order/order.route';


const router = Router();

const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/products',
        route: ProductRoutes
    },
    {
        path: '/orders',
        route: OrderRoutes
    },

];


moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;