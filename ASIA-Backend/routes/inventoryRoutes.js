const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

//
// GET Routes
//

// GET /api/inventory - Get all inventory items
router.get('/', inventoryController.getAllInventory);

// GET /api/inventory/low-stock - Get low stock inventory items
router.get('/low-stock', inventoryController.getLowStockInventory);

// GET /api/inventory/metrics - Get inventory metrics (total revenue, quantity, trending product)
router.get('/metrics', inventoryController.getInventoryMetrics);

// GET /api/inventory/:id - Get inventory record by inventory ID
router.get('/:id', inventoryController.getInventoryById);

//
// POST Route
//

// POST /api/inventory - Create a new inventory record
router.post('/', inventoryController.createInventory);

//
// PUT Routes
//

// PUT /api/inventory/:id - Update inventory by inventory ID
router.put('/:id', inventoryController.updateInventory);

// PUT /api/inventory/product/:productId - Update inventory by product ID
router.put('/product/:productId', inventoryController.updateInventoryByProductId);

//
// DELETE Route
//

// DELETE /api/inventory/:id - Delete inventory record by inventory ID
router.delete('/:id', inventoryController.deleteInventory);

module.exports = router;