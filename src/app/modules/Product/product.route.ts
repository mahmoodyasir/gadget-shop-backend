import express from 'express';
import validateRequest from '../../middlewares/validateRequests';
import { ProductControllers } from './product.controller';
import upload from '../../middlewares/upload';

const router = express.Router();

router.post('/', upload.array('images'),
    ProductControllers.createProduct);



export const ProductRoutes = router;