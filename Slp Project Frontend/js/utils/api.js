// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/product';

// Fetch all active products from backend
// async function fetchActiveProducts() {
//     try {
//         const response = await fetch(`${API_BASE_URL}/get/products/`);
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const products = await response.json();
//         console.log('📦 Products loaded from API:', products);
//         return products;
//     } catch (error) {
//         console.error('❌ Error fetching products:', error);
//         // Fallback to sample products if API fails
//         return SAMPLE_PRODUCTS;
//     }
// }



// In fetchActiveProducts function, add:
async function fetchActiveProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/get/products/`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        console.log('📦 RAW API RESPONSE:', products);
        console.log('🔍 Product count:', products.length);
        
        // Log each product's status
        products.forEach((product, index) => {
            console.log(`Product ${index + 1}:`, {
                id: product.id,
                title: product.title,
                status: product.status,
                variants: product.variants?.length || 0
            });
        });
        
        return products;
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        return [];
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
// function transformProductData(backendProducts) {
//     return backendProducts.map(product => {
//         // Get the first variant for display
//         const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
        
//         // Get the primary image or first image
//         let productImage = 'assets/default-product.jpg';
//         if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
//             const primaryImage = firstVariant.images.find(img => img.is_primary) || firstVariant.images[0];
//             productImage = primaryImage.image;
//         }
        
//         // Generate category name (you might want to fetch categories separately)
//         const categoryName = product.category?.[0]?.name || 'Uncategorized';
        
//         return {
//             id: product.id.toString(),
//             title: product.title,
//             price: parseFloat(firstVariant?.adjusted_price || product.base_price),
//             rating: 4.5, // You can add ratings to your backend later
//             img: productImage,
//             category: categoryName,
//             desc: product.description,
//             variants: product.variants || []
//         };
//     });
// }



// Transform backend product data to frontend format
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
        
        // EXTRACT CATEGORIES PROPERLY
        let rootCategory = 'General'; // For featured section (Fashion)
        let displayCategory = 'General'; // For product cards (Clothes)
        
        if (product.category_path && product.category_path.length > 0) {
            // Root category is the first element (Fashion)
            rootCategory = product.category_path[0];
            
            // Display category logic:
            if (product.category_path.length === 1) {
                // Only one category: Fashion -> use Fashion
                displayCategory = product.category_path[0];
            } else if (product.category_path.length === 2) {
                // Two categories: Fashion -> Clothes -> use Clothes
                displayCategory = product.category_path[1];
            } else {
                // Three or more categories: Fashion -> Clothes -> Shirt -> use Clothes (the middle one)
                displayCategory = product.category_path[1];
            }
        }
        
        // Fallback to category array if path not available
        if ((!product.category_path || product.category_path.length === 0) && product.category && product.category.length > 0) {
            const categoryObj = product.category[0];
            if (typeof categoryObj === 'object' && categoryObj.name) {
                displayCategory = categoryObj.name;
                // Try to get parent for root category
                if (categoryObj.parent && categoryObj.parent.name) {
                    rootCategory = categoryObj.parent.name;
                } else {
                    rootCategory = categoryObj.name;
                }
            }
        }
        
        return {
            id: product.id.toString(),
            title: product.title,
            price: parseFloat(firstVariant?.adjusted_price || product.base_price),
            rating: 4.5,
            img: productImage,
            category: rootCategory, // For featured categories section (Fashion)
            displayCategory: displayCategory, // For product cards (Clothes)
            fullCategoryPath: product.category_path || [],
            desc: product.description,
            variants: product.variants || []
        };
    });
}


// Fetch single product details from backend
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/get/product/${productId}/`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const productData = await response.json();
        console.log('📦 Product details loaded:', productData);
        
        // Handle both array and single object responses
        const product = Array.isArray(productData) ? productData[0] : productData;
        return product;
    } catch (error) {
        console.error('❌ Error fetching product details:', error);
        return null;
    }
}

// Fetch products by category
async function fetchProductsByCategory(categoryId) {
    try {
        const allProducts = await fetchActiveProducts();
        return allProducts.filter(product => 
            product.category?.some(cat => cat.id === categoryId)
        );
    } catch (error) {
        console.error('❌ Error fetching products by category:', error);
        return [];
    }
}

// Export functions for global access
window.fetchActiveProducts = fetchActiveProducts;
window.fetchProductDetails = fetchProductDetails;
window.transformProductData = transformProductData;