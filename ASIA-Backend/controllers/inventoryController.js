const pool = require('../config/conn');

// Get all inventory items
exports.getAllInventory = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT i.*, p.name as product_name, p.sku
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
        `);
        
        res.status(200).json({
            success: true,
            message: 'Inventory records retrieved successfully',
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// Get inventory by ID
exports.getInventoryById = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT i.*, p.name as product_name, p.sku
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.inventory_id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inventory record not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Inventory record retrieved successfully',
            data: rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Get low stock inventory items
exports.getLowStockInventory = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT i.*, p.name as product_name, p.sku, p.category
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.quantity <= i.reorder_level
            ORDER BY i.quantity ASC
        `);
        
        res.status(200).json({
            success: true,
            message: 'Low stock inventory records retrieved successfully',
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// Create a new inventory record
exports.createInventory = async (req, res, next) => {
    try {
        const { product_id, quantity, reorder_level } = req.body;
        
        console.log('Request body:', req.body); // Debug log
        
        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }
        
        // Check if product exists
        const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [product_id]);
        
        console.log('Product rows:', productRows); // Debug log
        
        if (productRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if inventory record already exists for this product
        const [existingRows] = await pool.query('SELECT * FROM inventory WHERE product_id = ?', [product_id]);
        
        if (existingRows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Inventory record already exists for this product'
            });
        }
        
        // Use default values if not provided
        const quantityValue = quantity !== undefined ? quantity : 0;
        const reorderValue = reorder_level !== undefined ? reorder_level : 10;
        
        console.log('Inserting inventory with values:', {
            product_id,
            quantity: quantityValue,
            reorder_level: reorderValue
        });
        
        const [result] = await pool.query(
            'INSERT INTO inventory (product_id, quantity, reorder_level) VALUES (?, ?, ?)',
            [product_id, quantityValue, reorderValue]
        );
        
        const [newInventory] = await pool.query(`
            SELECT i.*, p.name as product_name, p.sku
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.inventory_id = ?
        `, [result.insertId]);
        
        res.status(201).json({
            success: true,
            message: 'Inventory record created successfully',
            data: newInventory[0]
        });
    } catch (error) {
        console.error('Error creating inventory:', error); // Detailed error log
        
        // Always show the detailed error message for debugging
        res.status(500).json({
            success: false,
            message: 'Failed to create inventory record',
            error: error.message,
            stack: error.stack
        });
    }
};

// Update inventory
exports.updateInventory = async (req, res, next) => {
    try {
        const { quantity, reorder_level } = req.body;
        const inventoryId = req.params.id;
        
        // Check if inventory record exists
        const [inventoryRows] = await pool.query('SELECT * FROM inventory WHERE inventory_id = ?', [inventoryId]);
        
        if (inventoryRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inventory record not found'
            });
        }
        
        await pool.query(
            'UPDATE inventory SET quantity = ?, reorder_level = ? WHERE inventory_id = ?',
            [quantity, reorder_level, inventoryId]
        );
        
        const [updatedInventory] = await pool.query(`
            SELECT i.*, p.name as product_name, p.sku
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.inventory_id = ?
        `, [inventoryId]);
        
        res.status(200).json({
            success: true,
            message: 'Inventory record updated successfully',
            data: updatedInventory[0]
        });
    } catch (error) {
        next(error);
    }
};

// Update inventory by product ID
exports.updateInventoryByProductId = async (req, res, next) => {
    try {
        const { quantity, reorder_level } = req.body;
        const productId = req.params.productId;
        
        // Check if product exists
        const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
        
        if (productRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if inventory record exists
        const [inventoryRows] = await pool.query('SELECT * FROM inventory WHERE product_id = ?', [productId]);
        
        if (inventoryRows.length === 0) {
            // Create new inventory record if it doesn't exist
            const [result] = await pool.query(
                'INSERT INTO inventory (product_id, quantity, reorder_level) VALUES (?, ?, ?)',
                [productId, quantity || 0, reorder_level || 10]
            );
            
            const [newInventory] = await pool.query(`
                SELECT i.*, p.name as product_name, p.sku
                FROM inventory i
                JOIN products p ON i.product_id = p.product_id
                WHERE i.inventory_id = ?
            `, [result.insertId]);
            
            return res.status(201).json({
                success: true,
                message: 'Inventory record created',
                data: newInventory[0]
            });
        }
        
        // Update existing inventory record
        await pool.query(
            'UPDATE inventory SET quantity = ?, reorder_level = ? WHERE product_id = ?',
            [quantity, reorder_level, productId]
        );
        
        const [updatedInventory] = await pool.query(`
            SELECT i.*, p.name as product_name, p.sku
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.product_id = ?
        `, [productId]);
        
        res.status(200).json({
            success: true,
            data: updatedInventory[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete inventory
exports.deleteInventory = async (req, res, next) => {
    try {
        const inventoryId = req.params.id;
        
        // Check if inventory record exists
        const [inventoryRows] = await pool.query('SELECT * FROM inventory WHERE inventory_id = ?', [inventoryId]);
        
        if (inventoryRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inventory record not found'
            });
        }
        
        await pool.query('DELETE FROM inventory WHERE inventory_id = ?', [inventoryId]);
        
        res.status(200).json({
            success: true,
            message: 'Inventory record deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get inventory metrics
exports.getInventoryMetrics = async (req, res, next) => {
    try {
        // Get total revenue and quantity from sales
        const [salesMetrics] = await pool.query(`
            SELECT 
                SUM(total_amount) as total_revenue,
                SUM(quantity) as total_quantity
            FROM sales
        `);

        // Get trending product (product with most sales in last 30 days)
        const [trendingProduct] = await pool.query(`
            SELECT 
                p.name,
                p.product_id,
                SUM(s.quantity) as total_sold
            FROM sales s
            JOIN products p ON s.product_id = p.product_id
            WHERE s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY p.product_id, p.name
            ORDER BY total_sold DESC
            LIMIT 1
        `);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: salesMetrics[0].total_revenue || 0,
                totalQuantity: salesMetrics[0].total_quantity || 0,
                trendingProduct: trendingProduct[0]?.name || '-'
            }
        });
    } catch (error) {
        next(error);
    }
};