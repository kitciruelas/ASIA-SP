# ASIA Product Analytics Dashboard

A comprehensive product analytics dashboard that provides real-time insights into sales, inventory, and product performance metrics.

## Overview

The ASIA Product Analytics Dashboard is a web-based application that helps businesses track and analyze their product performance through various visualizations including:

- Total Revenue and Sales Metrics (Line Chart)
- Stock Distribution Analysis (Bar Chart)
- Sales Trends and Patterns (Line Chart)
- Product Performance Metrics (Radar Chart)
- Inventory Status and Alerts (Doughnut Chart)

## Tech Stack

### Frontend
- HTML5
- CSS3 (Bootstrap 5.3.2)
- JavaScript (ES6+)
- Chart.js for data visualization
- Font Awesome 6.0.0 for icons

### Backend
- Node.js
- Express.js
- MySQL Database

## Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ASIA.git
cd ASIA
```

2. Install backend dependencies:
```bash
cd ASIA-Backend
npm install
```

3. Set up the database:
- Create a MySQL database named `product_sales_db`
- Import the database schema from `database/product_sales_db.sql`

4. Configure environment variables:
- Create a `.env` file in the ASIA-Backend directory
- Add the following configuration:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=asia_db
PORT=5000
```

5. Install frontend dependencies:
```bash
cd ../src
npm install
```

## API Endpoints

### Products
- `GET /api/products` - Get all products with inventory data (Used by Stock Distribution Bar Chart and Stock Status Doughnut Chart)
- `GET /api/products/:id` - Get a specific product
- `GET /api/products/low-stock` - Get products with low stock
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Sales
- `GET /api/sales` - Get all sales records (Used by Monthly Sales Line Chart and Product Performance Radar Chart)
- `GET /api/sales/metrics` - Get sales metrics (total revenue, quantity) (Used by Overall Dashboard Metrics: Total Revenue and Total Quantity Sold)
- `GET /api/sales/trending` - Get trending products (Used by Overall Dashboard Metrics: Trending Product)
- `POST /api/sales` - Record a new sale

### Inventory
- `GET /api/inventory` - Get all inventory records
- `PUT /api/inventory/:id` - Update inventory for a product

## Running the Project

1. Start the backend server:
```bash
cd ASIA-Backend
npm start
```
2. Start the frontend:
```bash
cd src
# If using a local server like XAMPP, place the src folder in htdocs
# Or use any static file server
```

3. Access the dashboard:
- Open your browser and navigate to `http://localhost/ASIA/src`
- Or if using a different port: `http://localhost:your_port`

## Features

### Dashboard Metrics
- Total Revenue Display
- Total Quantity Sold
- Trending Product Highlight

### Charts and Visualizations
1. Line Chart
   - Monthly Sales Trends
   - Revenue Patterns

2. Bar Chart
   - Stock Distribution
   - Product-wise Inventory Levels

3. Doughnut Chart
   - Stock Status Distribution
   - Low Stock vs Normal Stock

4. Radar Chart
   - Product Performance Metrics
   - Multi-dimensional Analysis

### Responsive Design
- Mobile-friendly interface
- Collapsible sidebar
- Adaptive layouts

## Group Member
- Abrenica, Sharmaine
- Alisuag, Clark
- Ciruelas, Keith Andrei 
