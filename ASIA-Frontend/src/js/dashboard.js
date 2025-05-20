// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    loadDashboardData();
    console.log('Page loaded, fetching trending products count...');
    fetchTrendingProducts();
});

async function loadDashboardData() {
    try {
        // Fetch sales metrics
        const metricsResponse = await fetch('http://localhost:5000/api/sales/metrics');
        const metricsData = await metricsResponse.json();
        
        if (metricsData.success) {
            // Update total revenue
            const totalRevenue = document.getElementById('totalRevenue');
            if (totalRevenue) {
                totalRevenue.textContent = `₱${parseFloat(metricsData.data.total_revenue || 0).toFixed(2)}`;
            }

            // Update total quantity
            const totalQuantity = document.getElementById('totalQuantity');
            if (totalQuantity) {
                totalQuantity.textContent = metricsData.data.total_units_sold || 0;
            }
        }

        // Fetch trending products
        const trendingResponse = await fetch('http://localhost:5000/api/sales/trending');
        const trendingData = await trendingResponse.json();
        
        if (trendingData.success && trendingData.data.length > 0) {
            // Update trending product
            const trendingProduct = document.getElementById('trendingProduct');
            if (trendingProduct) {
                trendingProduct.textContent = trendingData.data[0].product_name || '-';
            }
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Show error in the metrics
        document.getElementById('totalRevenue').textContent = 'Error';
        document.getElementById('totalQuantity').textContent = 'Error';
        document.getElementById('trendingProduct').textContent = 'Error';
    }
}

// Refresh data every 5 minutes
setInterval(loadDashboardData, 5 * 60 * 1000);

// Function to fetch trending products count
async function fetchTrendingProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/sales/trending');
        const data = await response.json();
        console.log('Trending Products Data:', data); // Debug log

        if (data.success && data.data) {
            // Get the count of trending products
            const trendingCount = data.data.length;
            
            // Update the trending product display with count
            const trendingElement = document.getElementById('trendingProduct');
            if (trendingElement) {
                trendingElement.textContent = trendingCount;
                console.log('Updated trending count to:', trendingCount);
            }
        } else {
            console.log('No trending products found');
            document.getElementById('trendingProduct').textContent = '0';
        }
    } catch (error) {
        console.error('Error fetching trending products:', error);
        document.getElementById('trendingProduct').textContent = 'Error';
    }
} 