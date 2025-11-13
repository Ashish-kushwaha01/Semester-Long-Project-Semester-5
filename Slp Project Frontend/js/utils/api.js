// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/product';

// Fetch all active products from backend
async function fetchActiveProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/get/products/`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        console.log('📦 Products loaded from API:', products);
        return products;
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        // Fallback to sample products if API fails
        return SAMPLE_PRODUCTS;
    }
}

// Fetch single product details
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/get/product/${productId}/`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        return product;
    } catch (error) {
        console.error('❌ Error fetching product details:', error);
        return null;
    }
}

// Transform backend product data to frontend format
function transformProductData(backendProducts) {
    return backendProducts.map(product => {
        // Get the first variant for display
        const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
        
        // Get the primary image or first image
        let productImage = 'assets/default-product.jpg';
        if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
            const primaryImage = firstVariant.images.find(img => img.is_primary) || firstVariant.images[0];
            productImage = primaryImage.image;
        }
        
        // Generate category name (you might want to fetch categories separately)
        const categoryName = product.category?.[0]?.name || 'Uncategorized';
        
        return {
            id: product.id.toString(),
            title: product.title,
            price: parseFloat(firstVariant?.adjusted_price || product.base_price),
            rating: 4.5, // You can add ratings to your backend later
            img: productImage,
            category: categoryName,
            desc: product.description,
            variants: product.variants || []
        };
    });
}

// Export functions for global access
window.fetchActiveProducts = fetchActiveProducts;
window.fetchProductDetails = fetchProductDetails;
window.transformProductData = transformProductData;