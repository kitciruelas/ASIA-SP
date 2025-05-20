const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products - Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/low-stock - Get products with low stock
router.get('/low-stock', productController.getLowStockProducts);

// GET /api/products/:id - Get a single product
router.get('/:id', productController.getProductById);

// GET /api/products/:id/inventory - Get inventory for a specific product
router.get('/:id/inventory', productController.getProductInventory);

// GET /api/products/:id/sales - Get sales data for a specific product
router.get('/:id/sales', productController.getProductSales);

// GET /api/products/:id/sales-trends - Get sales trends for a specific product
router.get('/:id/sales-trends', productController.getProductSalesTrends);

// POST /api/products - Create a new product
router.post('/', productController.createProduct);

// POST /api/products/record-sale - Record a new sale
router.post('/record-sale', productController.recordSale);

// PUT /api/products/:id - Update a product
router.put('/:id', productController.updateProduct);

// PUT /api/products/:id/inventory - Update product inventory
router.put('/:id/inventory', productController.updateInventory);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', productController.deleteProduct);

module.exports = router;