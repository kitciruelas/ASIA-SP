const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// GET /api/sales - Get all sales
router.get('/', salesController.getAllSales);

// GET /api/sales/by-product/:productId - Get sales by product
router.get('/by-product/:productId', salesController.getSalesByProduct);

//GET api/sales/by-date?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// - Get sales by date range
router.get('/by-date', salesController.getSalesByDateRange);

// GET /api/sales/summary/by-product - Get sales summary by product
router.get('/summary/by-product', salesController.getSalesSummaryByProduct);

// GET /api/sales/summary/monthly - Get monthly sales summary
router.get('/summary/monthly', salesController.getMonthlySalesSummary);

// GET /api/sales/performance - Sales performance by product
router.get('/performance', salesController.getSalesPerformance);

// GET /api/sales/metrics - Get sales metrics
router.get('/metrics', salesController.getSalesMetrics);

// GET /api/sales/trending - Get trending products
router.get('/trending', salesController.getTrendingProducts);

// GET /api/sales/:id - Get sale by ID
router.get('/:id', salesController.getSaleById);

// GET /api/sales/metrics/revenue - Revenue metrics
router.get('/metrics/revenue', salesController.getRevenueMetrics);

// GET /api/sales/metrics/quantitysold - Quantity sold metrics
router.get('/metrics/quantitysold', salesController.getQuantitySoldMetrics);

// POST /api/sales - Record a new sale
router.post('/', salesController.recordSale);

// PUT /api/sales/:id - Update a sale
router.put('/:id', salesController.updateSale);

// DELETE /api/sales/:id - Delete a sale
router.delete('/:id', salesController.deleteSale);

module.exports = router;