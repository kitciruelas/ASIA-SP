const pool = require('../config/conn');

// Get all sales
exports.getAllSales = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, p.name as product_name, p.sku
            FROM sales s
            JOIN products p ON s.product_id = p.product_id
            ORDER BY s.sale_date DESC
        `);
        
        res.status(200).json({
            success: true,
            message: 'Sales records retrieved successfully',
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// Get sale by ID
exports.getSaleById = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, p.name as product_name, p.sku
            FROM sales s
            JOIN products p ON s.product_id = p.product_id
            WHERE s.sale_id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sale record not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Sale record retrieved successfully',
            data: rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Get sales by product ID
exports.getSalesByProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        
        // Check if product exists
        const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
        
        if (productRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const [rows] = await pool.query(`
            SELECT s.*, p.name as product_name, p.sku
            FROM sales s
            JOIN products p ON s.product_id = p.product_id
            WHERE s.product_id = ?
            ORDER BY s.sale_date DESC
        `, [productId]);
        
        res.status(200).json({
            success: true,
            message: 'Product sales records retrieved successfully',
            product: productRows[0],
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// Get sales by date range
exports.getSalesByDateRange = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }
        
        const [rows] = await pool.query(`
            SELECT s.*, p.name as product_name, p.sku
            FROM sales s
            JOIN products p ON s.product_id = p.product_id
            WHERE s.sale_date BETWEEN ? AND ?
            ORDER BY s.sale_date DESC
        `, [startDate, endDate]);
        
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// Get sales summary by product
exports.getSalesSummaryByProduct = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.product_id,
                p.name as product_name,
                p.sku,
                p.category,
                SUM(s.quantity) as total_quantity_sold,
                SUM(s.total_amount) as total_revenue
            FROM sales s
            JOIN products p ON s.product_id = p.product_id
            GROUP BY p.product_id
            ORDER BY total_revenue DESC
        `);
        
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// Get monthly sales summary
exports.getMonthlySalesSummary = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                DATE_FORMAT(sale_date, '%Y-%m') as month,
                SUM(quantity) as total_quantity,
                SUM(total_amount) as total_revenue,
                COUNT(*) as transaction_count
            FROM sales
            GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
            ORDER BY month DESC
        `);
        
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// Record a new sale
exports.recordSale = async (req, res, next) => {
    try {
        const { product_id, quantity, sale_date, total_amount } = req.body;
        
        if (!product_id || !quantity || !total_amount) {
            return res.status(400).json({
                success: false,
                message: 'Product ID, quantity, and total amount are required'
            });
        }
        
        // Check if product exists
        const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [product_id]);
        
        if (productRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Use current date if not provided
        const saleDate = sale_date || new Date().toISOString().split('T')[0];
        
        const [result] = await pool.query(
            'INSERT INTO sales (product_id, quantity, sale_date, total_amount) VALUES (?, ?, ?, ?)',
            [product_id, quantity, saleDate, total_amount]
        );
        
        // Update inventory if it exists
        const [inventoryRows] = await pool.query('SELECT * FROM inventory WHERE product_id = ?', [product_id]);
        
        if (inventoryRows.length > 0) {
            const newQuantity = Math.max(0, inventoryRows[0].quantity - quantity);
            await pool.query(
                'UPDATE inventory SET quantity = ? WHERE product_id = ?',
                [newQuantity, product_id]
            );
        }
        
        const [newSale] = await pool.query(`
            SELECT s.*, p.name as product_name, p.sku
            FROM sales s
            JOIN products p ON s.product_id = p.product_id
            WHERE s.sale_id = ?
        `, [result.insertId]);
        
        res.status(201).json({
            success: true,
            message: 'Sale record created successfully',
            data: newSale[0],
            inventory_updated: inventoryRows.length > 0
        });
    } catch (error) {
        next(error);
    }
};

// Update a sale
exports.updateSale = async (req, res, next) => {
    try {
        const { product_id, quantity, sale_date, total_amount } = req.body;
        const saleId = req.params.id;
        
        // Check if sale exists
        const [saleRows] = await pool.query('SELECT * FROM sales WHERE sale_id = ?', [saleId]);
        
        if (saleRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sale record not found'
            });
        }
        
        const oldSale = saleRows[0];
        
        // Check if product exists if product_id is being changed
        if (product_id && product_id !== oldSale.product_id) {
            const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [product_id]);
            
            if (productRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
        }
        
        // Update inventory for old product (add back the old quantity)
        if (quantity !== oldSale.quantity || product_id !== oldSale.product_id) {
            const [oldInventoryRows] = await pool.query('SELECT * FROM inventory WHERE product_id = ?', [oldSale.product_id]);
            
            if (oldInventoryRows.length > 0) {
                await pool.query(
                    'UPDATE inventory SET quantity = quantity + ? WHERE product_id = ?',
                    [oldSale.quantity, oldSale.product_id]
                );
            }
            
            // Update inventory for new product (subtract the new quantity)
            const newProductId = product_id || oldSale.product_id;
            const [newInventoryRows] = await pool.query('SELECT * FROM inventory WHERE product_id = ?', [newProductId]);
            
            if (newInventoryRows.length > 0) {
                const newQuantity = Math.max(0, newInventoryRows[0].quantity - quantity);
                await pool.query(
                    'UPDATE inventory SET quantity = ? WHERE product_id = ?',
                    [newQuantity, newProductId]
                );
            }
        }
        
        await pool.query(
            'UPDATE sales SET product_id = ?, quantity = ?, sale_date = ?, total_amount = ? WHERE sale_id = ?',
            [
                product_id || oldSale.product_id,
                quantity || oldSale.quantity,
                sale_date || oldSale.sale_date,
                total_amount || oldSale.total_amount,
                saleId
            ]
        );
        
        const [updatedSale] = await pool.query(`
            SELECT s.*, p.name as product_name, p.sku
            FROM sales s
            JOIN products p ON s.product_id = p.product_id
            WHERE s.sale_id = ?
        `, [saleId]);
        
        res.status(200).json({
            success: true,
            message: 'Sale record updated successfully',
            data: updatedSale[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete a sale
exports.deleteSale = async (req, res, next) => {
    try {
        const saleId = req.params.id;
        
        // Check if sale exists
        const [saleRows] = await pool.query('SELECT * FROM sales WHERE sale_id = ?', [saleId]);
        
        if (saleRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sale record not found'
            });
        }
        
        const sale = saleRows[0];
        
        // Update inventory (add back the quantity)
        const [inventoryRows] = await pool.query('SELECT * FROM inventory WHERE product_id = ?', [sale.product_id]);
        
        if (inventoryRows.length > 0) {
            await pool.query(
                'UPDATE inventory SET quantity = quantity + ? WHERE product_id = ?',
                [sale.quantity, sale.product_id]
            );
        }
        
        await pool.query('DELETE FROM sales WHERE sale_id = ?', [saleId]);
        
        res.status(200).json({
            success: true,
            message: 'Sale record deleted successfully',
            inventory_updated: inventoryRows.length > 0
        });
    } catch (error) {
        next(error);
    }
};

// Get sales metrics
exports.getSalesMetrics = async (req, res, next) => {
    try {
        const [metrics] = await pool.query(`
            SELECT 
                COUNT(*) as total_sales,
                SUM(quantity) as total_units_sold,
                SUM(total_amount) as total_revenue,
                AVG(total_amount) as average_sale_value,
                MAX(total_amount) as highest_sale,
                MIN(total_amount) as lowest_sale
            FROM sales
        `);
        
        res.status(200).json({
            success: true,
            data: metrics[0]
        });
    } catch (error) {
        next(error);
    }
};

// Get trending products
exports.getTrendingProducts = async (req, res, next) => {
    try {
        const [trending] = await pool.query(`
            SELECT 
                p.product_id,
                p.name as product_name,
                p.sku,
                COUNT(s.sale_id) as sale_count,
                SUM(s.quantity) as total_quantity_sold,
                SUM(s.total_amount) as total_revenue
            FROM sales s
            JOIN products p ON s.product_id = p.product_id
            WHERE s.sale_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
            GROUP BY p.product_id
            ORDER BY total_quantity_sold DESC
            LIMIT 10
        `);
        
        res.status(200).json({
            success: true,
            data: trending
        });
    } catch (error) {
        next(error);
    }
};