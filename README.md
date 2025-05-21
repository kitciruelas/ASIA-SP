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
git clone https://github.com/y/ASIA-SP.git
cd ASIA-SP
```

2. Install backend dependencies:
```bash
cd ASIA-Backend
npm install
```

3. Set up the database:
- Create a MySQL database named `product_sales_db`
- Import the database schema from `database/product_sales_db.sql`

5. Run the server:
- npm run dev

## Testing API Endpoints
- Use Postman to test API endpoints
1. Download Postman from this link https://www.postman.com/downloads/
2. Install and launch the app
3. Create new HTTP Request.
4. Set the HTTP method (GET, POST, PUT, DELETE, etc.).
5. Enter the API URL (e.g., http://localhost:5000/api/sales).
6. Then click the Send and analyze the response

## API Endpoints Used in Dashboard

### Charts and Metrics Endpoints

1. **Line Chart - Sales Amount**
   - Endpoint: `GET /api/products/:id/sales-trends`
   - Used for: Displaying sales trends for specific products

2. **Bar Chart - Top 20 Products Stock**
   - Endpoint: `GET /api/products/top-stocked`
   - Used for: Showing top 20 products by stock level

3. **Doughnut Chart - Stock Level Distribution**
   - Endpoint: `GET /api/products/stock-classification-summary`
   - Used for: Displaying stock level distribution

4. **Radar Chart - Top 5 Products Performance**
   - Endpoint: `GET /api/sales/performance`
   - Used for: Showing performance comparison of exactly 5 top products by revenue

5. **Total Revenue**
   - Endpoint: `GET /api/sales/metrics/revenue`
   - Used for: Displaying total revenue metrics

6. **Total Quantity Sold**
   - Endpoint: `GET /api/sales/metrics/quantitysold`
   - Used for: Displaying total quantity sold metrics

7. **Trending Product**
   - Endpoint: `GET /api/sales/trending`
   - Used for: Showing trending products

## Group Members
- Abrenica, Sharmaine
- Alisuag, Clark
- Ciruelas, Keith Andrei

## Running the Project

1. Start the backend server:
```bash
cd ASIA-Backend
npm start
or
npm run dev "server.js"
```
2. Start the frontend:
```bash
cd src
or Live Server and click src http://your_localhost:5500/src/
# If using a local server like XAMPP, place the src folder in htdocs
# Or use any static file server
```

3. Access the dashboard:
- Open your browser and navigate to `http://localhost:5500/src/index.html`
- Or if using a different port: `http://localhost:your_port`

## Features

### Dashboard Metrics
- Total Revenue Display
- Total Quantity Sold
-  Highlight Trending Product

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