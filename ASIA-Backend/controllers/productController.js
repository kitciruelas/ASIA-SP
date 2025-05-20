const pool = require('../config/conn');

// Get all products
exports.getAllProducts = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, COALESCE(i.quantity, 0) as quantity
            FROM products p
            LEFT JOIN inventory i ON p.product_id = i.product_id
        `);
        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving products',
            error: error.message
        });
    }
};

// Get a single product by ID
exports.getProductById = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Product retrieved successfully',
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving product',
            error: error.message
        });
    }
};

// Get inventory for a specific product
exports.getProductInventory = async (req, res, next) => {
    try {
        const productId = req.params.id;
        
        const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
        
        if (productRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const [inventoryRows] = await pool.query(`
            SELECT * FROM inventory WHERE product_id = ?
        `, [productId]);
        
        res.status(200).json({
            success: true,
            message: 'Product inventory retrieved successfully',
            product: productRows[0],
            inventory: inventoryRows.length > 0 ? inventoryRows[0] : null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving product inventory',
            error: error.message
        });
    }
};

// Get sales data for a specific product
exports.getProductSales = async (req, res, next) => {
    try {
        const productId = req.params.id;
        
        // First check if the product exists
        const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
        
        if (productRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Get sales data for the product
        const [salesRows] = await pool.query(`
            SELECT * FROM sales WHERE product_id = ? ORDER BY sale_date DESC
        `, [productId]);
        
        res.status(200).json({
            success: true,
            product: productRows[0],
            sales: salesRows
        });
    } catch (error) {
        next(error);
    }
};

// Get sales trends (monthly summary) for a specific product
exports.getProductSalesTrends = async (req, res, next) => {
    try {
        const productId = req.params.id;
        
        // First check if the product exists
        const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
        
        if (productRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Get monthly sales data for the product
        const [trendRows] = await pool.query(`
            SELECT 
                DATE_FORMAT(sale_date, '%Y-%m') as month,
                SUM(quantity) as total_quantity,
                SUM(total_amount) as total_revenue
            FROM sales 
            WHERE product_id = ? 
            GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
            ORDER BY month DESC
        `, [productId]);
        
        res.status(200).json({
            success: true,
            product: productRows[0],
            salesTrends: trendRows
        });
    } catch (error) {
        next(error);
    }
};

// Create a new product
exports.createProduct = async (req, res, next) => {
    try {
        const { name, description, price, cost, category, sku } = req.body;
        
        if (!name || !price || !cost || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, cost, and category are required'
            });
        }
        
        const [result] = await pool.query(
            'INSERT INTO products (name, description, price, cost, category, sku) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, cost, category, sku]
        );
        
        const [newProduct] = await pool.query('SELECT * FROM products WHERE product_id = ?', [result.insertId]);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct[0]
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'SKU already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// Update a product
exports.updateProduct = async (req, res, next) => {
    try {
        const { name, description, price, cost, category, sku } = req.body;
        const productId = req.params.id;
        
        const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
        
        if (productRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        await pool.query(
            'UPDATE products SET name = ?, description = ?, price = ?, cost = ?, category = ?, sku = ? WHERE product_id = ?',
            [name, description, price, cost, category, sku, productId]
        );
        
        const [updatedProduct] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
        
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct[0]
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'SKU already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Update product inventory
exports.updateInventory = async (req, res, next) => {
    try {
        const { quantity, reorder_level } = req.body;
        const productId = req.params.id;
        
        const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
        
        if (productRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const [inventoryRows] = await pool.query('SELECT * FROM inventory WHERE product_id = ?', [productId]);
        
        if (inventoryRows.length === 0) {
            await pool.query(
                'INSERT INTO inventory (product_id, quantity, reorder_level) VALUES (?, ?, ?)',
                [productId, quantity, reorder_level]
            );
            
            const [newInventory] = await pool.query('SELECT * FROM inventory WHERE product_id = ?', [productId]);
            
            return res.status(201).json({
                success: true,
                message: 'Product inventory created successfully',
                data: newInventory[0]
            });
        } else {
            await pool.query(
                'UPDATE inventory SET quantity = ?, reorder_level = ? WHERE product_id = ?',
                [quantity, reorder_level, productId]
            );
            
            const [updatedInventory] = await pool.query('SELECT * FROM inventory WHERE product_id = ?', [productId]);
            
            return res.status(200).json({
                success: true,
                message: 'Product inventory updated successfully',
                data: updatedInventory[0]
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product inventory',
            error: error.message
        });
    }
};

// Record a new sale
exports.recordSale = async (req, res, next) => {
    try {
        const { product_id, quantity, sale_date } = req.body;
        
        if (!product_id || !quantity || !sale_date) {
            return res.status(400).json({
                success: false,
                message: 'Product ID, quantity, and sale date are required'
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
        
        // Calculate total amount
        const price = productRows[0].price;
        const total_amount = price * quantity;
        
        // Insert sale record
        const [result] = await pool.query(
            'INSERT INTO sales (product_id, quantity, sale_date, total_amount) VALUES (?, ?, ?, ?)',
            [product_id, quantity, sale_date, total_amount]
        );
        
        // Update inventory
        await pool.query(
            'UPDATE inventory SET quantity = quantity - ? WHERE product_id = ?',
            [quantity, product_id]
        );
        
        const [newSale] = await pool.query('SELECT * FROM sales WHERE sale_id = ?', [result.insertId]);
        
        res.status(201).json({
            success: true,
            data: newSale[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete a product
exports.deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        
        // Check if product exists
        const [productRows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
        
        if (productRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Delete product (inventory and sales will be deleted via CASCADE)
        await pool.query('DELETE FROM products WHERE product_id = ?', [productId]);
        
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get low stock products
exports.getLowStockProducts = async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, i.quantity, i.reorder_level
            FROM products p
            JOIN inventory i ON p.product_id = i.product_id
            WHERE i.quantity <= i.reorder_level
            ORDER BY (i.quantity / i.reorder_level) ASC
        `);
        
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};