import express from 'express';
import validateRequest from '../../middlewares/validateRequests';
import { ProductControllers } from './product.controller';
import upload from '../../middlewares/upload';

const router = express.Router();

router.post('/', upload.array('images'),
    ProductControllers.createProduct);

router.post('/update_image/:productId', upload.array('images'),
    ProductControllers.updateProductImages);


router.post('/raw_insert',
    ProductControllers.createRawProduct);

router.get('/',
    ProductControllers.getAllProduct);

router.get('/get_feature',
    ProductControllers.getKeyFeature);

router.get('/:productId',
    ProductControllers.getProductDetails);

router.post("/filter", ProductControllers.filterProducts);





export const ProductRoutes = router;