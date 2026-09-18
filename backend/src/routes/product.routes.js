import express from 'express';
import { authenticateSeller } from '../middlewares/auth.middleware.js';
import { createProduct, getSellerProducts } from '../controllers/product.controller.js';
import multer from 'multer';
import { createProductValidator } from '../validator/product.validator.js';


const upload = multer({
    storage:multer.memoryStorage(),
    limits:{fileSize: 5 * 1024 * 1024} // 5 MB
})


const router = express.Router()

/**
 * @route POST /api/product
 * @description Create a new product
 * @access Private (Seller only)
 */


router.post("/", authenticateSeller, upload.array('images', 7), createProductValidator, createProduct)

/**
 * @route GET /api/products/seller
 * @description Get all products of the authenticated seller
 * @access Private (Seller only)
 */

router.get('/seller', authenticateSeller, getSellerProducts)


export default router;