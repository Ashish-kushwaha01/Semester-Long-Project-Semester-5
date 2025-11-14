// // CONSTANT TOKENS - PASTE YOUR TOKENS HERE
// const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYzMTIwNzA2LCJpYXQiOjE3NjMwMzQzMDYsImp0aSI6ImQxZWE0YTI5MjhhZjQ0ZTk4YzdlN2QyOTg0MmQ2N2QxIiwidXNlcl9pZCI6IjEifQ.fjpj1luOCiD8Q4cilHq95ZqTn9NgtUv08N8aMDqQcpQ";
// const REFRESH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzEyMDcwNiwiaWF0IjoxNzYzMDM0MzA2LCJqdGkiOiIwYzEwNTJhYzdhY2Y0Mjg3ODIwYTlhNDRlZTlmZjIwNSIsInVzZXJfaWQiOiIxIn0.wYcRzD_tiEZFzR2lAj80j8teCNXSp9bFtk6L_PQqRmQ";

// class VendorDashboard {
//     constructor() {
//         this.baseURL = 'http://localhost:8000/api/product'; // Update with your Django server URL
//         this.currentProductId = null;
//         this.currentVariantId = null;
//         this.categories = [];
//         this.products = [];
//         this.currentProductAttributes = [];

//         this.init();
//     }

//     init() {
//         if (!ACCESS_TOKEN || !REFRESH_TOKEN) {
//             this.showTokenWarning();
//             return;
//         }

//         this.bindEvents();
//         this.loadCategories();
//         this.loadProducts();
//         this.updateDashboardStats();
//     }

//     showTokenWarning() {
//         const warningHTML = `
//             <div id="token-warning" class="modal" style="display: block;">
//                 <div class="modal-content">
//                     <div class="modal-header">
//                         <h2 style="color: #e74c3c;">⚠️ Tokens Required</h2>
//                     </div>
//                     <div class="modal-body">
//                         <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
//                             <h4 style="color: #856404; margin-bottom: 0.5rem;">How to get tokens:</h4>
//                             <ol style="color: #856404; margin-left: 1.5rem;">
//                                 <li>Get tokens from Postman API response</li>
//                                 <li>Open vendor-dashboard.js file</li>
//                                 <li>Find ACCESS_TOKEN and REFRESH_TOKEN constants at the top</li>
//                                 <li>Paste your tokens between the quotes</li>
//                                 <li>Save the file and refresh this page</li>
//                             </ol>
//                         </div>
//                         <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 1rem;">
//                             <h4 style="color: #495057; margin-bottom: 0.5rem;">Current Token Status:</h4>
//                             <p style="color: #6c757d; margin: 0.25rem 0;">
//                                 <strong>ACCESS_TOKEN:</strong> 
//                                 <span style="color: ${ACCESS_TOKEN ? '#28a745' : '#dc3545'}">
//                                     ${ACCESS_TOKEN ? '✓ Set' : '✗ Missing'}
//                                 </span>
//                             </p>
//                             <p style="color: #6c757d; margin: 0.25rem 0;">
//                                 <strong>REFRESH_TOKEN:</strong> 
//                                 <span style="color: ${REFRESH_TOKEN ? '#28a745' : '#dc3545'}">
//                                     ${REFRESH_TOKEN ? '✓ Set' : '✗ Missing'}
//                                 </span>
//                             </p>
//                         </div>
//                         <div class="form-actions" style="margin-top: 1.5rem;">
//                             <button onclick="location.reload()" class="btn btn-primary">Refresh After Adding Tokens</button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `;

//         document.body.insertAdjacentHTML('beforeend', warningHTML);
//     }

//     bindEvents() {
//     console.log('🔧 Binding events...');

//     // Navigation - Menu items
//     document.querySelectorAll('.menu-item').forEach(item => {
//         if (item.dataset.page) {
//             item.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 console.log('📱 Menu item clicked:', item.dataset.page);
//                 this.switchPage(item.dataset.page);
//             });
//         }
//     });

//     // Add Product button in products section
//     const addProductBtn = document.querySelector('.btn-primary[data-page="add-product"]');
//     if (addProductBtn) {
//         addProductBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             console.log('➕ Add Product button clicked');
//             this.switchPage('add-product');
//         });
//     }

//     // Back to Products button in add-product section  
//     const backToProductsBtn = document.querySelector('.btn-secondary[data-page="products"]');
//     if (backToProductsBtn) {
//         backToProductsBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             console.log('⬅️ Back to Products button clicked');
//             this.switchPage('products');
//         });
//     }

//     // View All link in dashboard
//     const viewAllLink = document.querySelector('.view-all[data-page="products"]');
//     if (viewAllLink) {
//         viewAllLink.addEventListener('click', (e) => {
//             e.preventDefault();
//             console.log('👀 View All link clicked');
//             this.switchPage('products');
//         });
//     }

//     // Forms
//     document.getElementById('add-product-form')?.addEventListener('submit', (e) => this.addProduct(e));
//     document.getElementById('add-variant-form')?.addEventListener('submit', (e) => this.addVariant(e));
//     document.getElementById('edit-product-form')?.addEventListener('submit', (e) => this.editProduct(e));
//     document.getElementById('edit-variant-form')?.addEventListener('submit', (e) => this.editVariant(e));

//     // Modal controls
//     document.querySelectorAll('.close').forEach(close => {
//         close.addEventListener('click', () => this.closeAllModals());
//     });

//     // Buttons
//     document.getElementById('refresh-products')?.addEventListener('click', () => this.loadProducts());
//     document.getElementById('add-variant-btn')?.addEventListener('click', () => this.showAddVariantModal());
//     document.getElementById('logout-btn')?.addEventListener('click', (e) => {
//         e.preventDefault();
//         this.logout();
//     });

//     // Close modal buttons
//     document.querySelector('.close-edit-variant-modal')?.addEventListener('click', () => this.closeModal('edit-variant-modal'));
//     document.querySelector('.close-edit-product-modal')?.addEventListener('click', () => this.closeModal('edit-product-modal'));

//     // Search and filter
//     document.getElementById('search-products')?.addEventListener('input', (e) => this.filterProducts(e.target.value));
//     document.getElementById('status-filter')?.addEventListener('change', (e) => this.filterProductsByStatus(e.target.value));

//     // File upload
//     this.setupFileUpload();
//     this.setupEditFileUpload();

//     // Close modals on outside click
//     window.addEventListener('click', (e) => {
//         if (e.target.classList.contains('modal')) {
//             this.closeAllModals();
//         }
//     });

//     console.log('✅ All events bound successfully');
// }

//     setupFileUpload() {
//         const uploadArea = document.getElementById('file-upload-area');
//         const fileInput = document.getElementById('variant-images');

//         if (uploadArea && fileInput) {
//             uploadArea.addEventListener('click', () => fileInput.click());
//             uploadArea.addEventListener('dragover', (e) => {
//                 e.preventDefault();
//                 uploadArea.style.borderColor = 'var(--primary-color)';
//                 uploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
//             });
//             uploadArea.addEventListener('dragleave', () => {
//                 uploadArea.style.borderColor = 'var(--border-color)';
//                 uploadArea.style.background = '';
//             });
//             uploadArea.addEventListener('drop', (e) => {
//                 e.preventDefault();
//                 uploadArea.style.borderColor = 'var(--border-color)';
//                 uploadArea.style.background = '';
//                 if (e.dataTransfer.files.length > 0) {
//                     fileInput.files = e.dataTransfer.files;
//                     this.previewImages(fileInput.files);
//                 }
//             });

//             fileInput.addEventListener('change', (e) => {
//                 this.previewImages(e.target.files);
//             });
//         }
//     }

//     setupEditFileUpload() {
//         const uploadArea = document.getElementById('edit-file-upload-area');
//         const fileInput = document.getElementById('edit-variant-images');

//         if (uploadArea && fileInput) {
//             uploadArea.addEventListener('click', () => fileInput.click());
//             uploadArea.addEventListener('dragover', (e) => {
//                 e.preventDefault();
//                 uploadArea.style.borderColor = 'var(--primary-color)';
//                 uploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
//             });
//             uploadArea.addEventListener('dragleave', () => {
//                 uploadArea.style.borderColor = 'var(--border-color)';
//                 uploadArea.style.background = '';
//             });
//             uploadArea.addEventListener('drop', (e) => {
//                 e.preventDefault();
//                 uploadArea.style.borderColor = 'var(--border-color)';
//                 uploadArea.style.background = '';
//                 if (e.dataTransfer.files.length > 0) {
//                     fileInput.files = e.dataTransfer.files;
//                     this.previewEditImages(fileInput.files);
//                 }
//             });

//             fileInput.addEventListener('change', (e) => {
//                 this.previewEditImages(e.target.files);
//             });
//         }
//     }

//     previewImages(files) {
//         const previewContainer = document.getElementById('image-preview');
//         if (!previewContainer) return;

//         previewContainer.innerHTML = '';

//         Array.from(files).forEach((file, index) => {
//             if (file.type.startsWith('image/')) {
//                 const reader = new FileReader();
//                 reader.onload = (e) => {
//                     const preview = document.createElement('div');
//                     preview.className = 'preview-image';
//                     preview.innerHTML = `
//                         <img src="${e.target.result}" alt="Preview ${index + 1}">
//                         <button type="button" class="remove-image" onclick="this.parentElement.remove()">
//                             <i class="fas fa-times"></i>
//                         </button>
//                     `;
//                     previewContainer.appendChild(preview);
//                 };
//                 reader.readAsDataURL(file);
//             }
//         });
//     }

//     previewEditImages(files) {
//         const previewContainer = document.getElementById('edit-image-preview');
//         if (!previewContainer) return;

//         Array.from(files).forEach((file, index) => {
//             if (file.type.startsWith('image/')) {
//                 const reader = new FileReader();
//                 reader.onload = (e) => {
//                     const preview = document.createElement('div');
//                     preview.className = 'preview-image';
//                     preview.innerHTML = `
//                         <img src="${e.target.result}" alt="Preview ${index + 1}">
//                         <button type="button" class="remove-image" onclick="this.parentElement.remove()">
//                             <i class="fas fa-times"></i>
//                         </button>
//                     `;
//                     previewContainer.appendChild(preview);
//                 };
//                 reader.readAsDataURL(file);
//             }
//         });
//     }

//     switchPage(page) {
//         document.querySelectorAll('.menu-item').forEach(item => {
//             item.classList.toggle('active', item.dataset.page === page);
//         });

//         document.querySelectorAll('.content-section').forEach(section => {
//             section.classList.toggle('active', section.id === `${page}-section`);
//         });

//         if (page === 'products') {
//             this.loadProducts();
//         } else if (page === 'dashboard') {
//             this.updateDashboardStats();
//         }
//     }

//     async loadCategories() {
//         try {
//             console.log("Loading categories...");
//             this.showLoading(true);
//             const response = await fetch(`${this.baseURL}/categories/leaf-nodes/`, {
//                 headers: this.getHeaders()
//             });
//             console.log("Categories called.")
//             if (response.ok) {
//                 const data = await response.json();
//                 console.log(data)
//                 this.categories = Array.isArray(data) ? data : [];
//                 this.populateCategoryDropdown();
//                 this.showNotification('Categories loaded successfully', 'success');

//             } else if (response.status === 401) {
//                 this.handleTokenExpired();
//             } else {
//                 throw new Error(`HTTP ${response.status}: ${await response.text()}`);
//             }
//         } catch (error) {
//             console.error('Error loading categories:', error);
//             this.showNotification(`Failed to load categories: ${error.message}`, 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     populateCategoryDropdown() {
//         const dropdown = document.getElementById('product-category');
//         if (!dropdown) return;

//         dropdown.innerHTML = '<option value="">Select Category</option>';

//         this.categories.forEach(category => {
//             const option = document.createElement('option');
//             option.value = category.id;
//             option.textContent = category.name;
//             dropdown.appendChild(option);
//         });
//     }

//     async loadProducts() {
//         const container = document.getElementById('products-container');
//         if (!container) return;

//         container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading products...</p></div>';

//         try {
//             this.showLoading(true);
//             const response = await fetch(`${this.baseURL}/vendor/get/products/`, {
//                 headers: this.getHeaders()
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 this.products = Array.isArray(data) ? data : [];
//                 this.renderProducts();
//                 this.updateProductsCount();
//                 // this.showNotification('Products loaded successfully', 'success');
//             } else if (response.status === 401) {
//                 this.handleTokenExpired();
//             } else {
//                 throw new Error(`HTTP ${response.status}: ${await response.text()}`);
//             }
//         } catch (error) {
//             console.error('Error loading products:', error);
//             this.showNotification(`Failed to load products: ${error.message}`, 'error');
//             container.innerHTML = this.getErrorState('products', error.message);
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     renderProducts(products = this.products) {
//         const container = document.getElementById('products-container');
//         if (!container) return;

//         if (!products || products.length === 0) {
//             container.innerHTML = this.getEmptyState('products', 'No products found', 'Start by adding your first product');
//             return;
//         }

//         container.innerHTML = products.map(product => {
//             const variantCount = product.variants?.length || 0;
//             const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;
//             const categoryName = product.category?.[0]?.name || 'Uncategorized'; 

//             // Get the primary image from variants
//             let productImage = null;
//             if (product.variants && product.variants.length > 0) {
//                 for (let variant of product.variants) {
//                     if (variant.images && variant.images.length > 0) {
//                         // Find primary image or use first image
//                         const primaryImage = variant.images.find(img => img.is_primary) || variant.images[0];
//                         if (primaryImage) {
//                             productImage = primaryImage.image;
//                             console.log("Hey I am here. this is the image url: ", productImage);
//                             break;
//                         }
//                     }
//                 }
//             }

//             return `
//                 <div class="product-card" data-product-id="${product.id}">
//                     <div class="product-image">
//                         ${productImage ? 
//                             `<img src="${productImage}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
//                             `<i class="fas fa-box-open"></i>`
//                         }
//                     </div>
//                     <div class="product-content">
//                         <div class="product-header">
//                             <div>
//                                 <h3 class="product-title">${this.escapeHtml(product.title)}</h3>
//                                 <div class="product-price">₹${parseFloat(product.base_price).toFixed(2)}</div>
//                                 <small style="color: var(--secondary-color);">${categoryName}</small>
//                             </div>
//                             <span class="product-status status-${product.status}">${product.status}</span>
//                         </div>
//                         <p class="product-description">${this.escapeHtml(product.description)}</p>
//                         <div class="product-meta">
//                             <small>${variantCount} variant${variantCount !== 1 ? 's' : ''}</small>
//                             <small>Stock: ${totalStock}</small>
//                             <small>Created: ${new Date(product.created_at).toLocaleDateString()}</small>
//                         </div>
//                         <div class="product-actions">
//                             <button class="btn btn-secondary" onclick="dashboard.editProductModal(${product.id})">
//                                 <i class="fas fa-edit"></i> Edit
//                             </button>
//                             <button class="btn btn-primary" onclick="dashboard.showVariantsModal(${product.id})">
//                                 <i class="fas fa-list"></i> Variants
//                             </button>
//                             <button class="btn btn-danger" onclick="dashboard.deleteProduct(${product.id})">
//                                 <i class="fas fa-trash"></i> Delete
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             `;
//         }).join('');
//     }

//     async addProduct(e) {
//         e.preventDefault();

//         const form = e.target;
//         const formData = new FormData(form);

//         const productData = {
//             title: formData.get('title'),
//             description: formData.get('description'),
//             base_price: parseFloat(formData.get('base_price')),
//             category_id: parseInt(formData.get('category_id'))
//         };

//         if (!productData.title || !productData.description || !productData.base_price || !productData.category_id) {
//             this.showNotification('Please fill all required fields', 'error');
//             return;
//         }

//         try {
//             this.showLoading(true);
//             const response = await fetch(`${this.baseURL}/add-product/`, {
//                 method: 'POST',
//                 headers: this.getHeaders(),
//                 body: JSON.stringify(productData)
//             });

//             if (response.ok) {
//                 const result = await response.json();
//                 this.showNotification('Product added successfully! Now add variants.', 'success');
//                 form.reset();
//                 this.switchPage('products');
//                 this.loadProducts();
//             } else {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || `HTTP ${response.status}`);
//             }
//         } catch (error) {
//             console.error('Error adding product:', error);
//             this.showNotification(`Failed to add product: ${error.message}`, 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     async editProductModal(productId) {
//         try {
//             this.showLoading(true);
//             const product = this.products.find(p => p.id === productId);
//             if (!product) {
//                 this.showNotification('Product not found', 'error');
//                 return;
//             }

//             document.getElementById('edit-product-title').value = product.title;
//             document.getElementById('edit-product-price').value = product.base_price;
//             document.getElementById('edit-product-description').value = product.description;
//             document.getElementById('edit-product-status').value = product.status;

//             this.currentProductId = productId;
//             this.showModal('edit-product-modal');
//         } catch (error) {
//             console.error('Error opening edit product modal:', error);
//             this.showNotification('Error loading product details', 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     async editProduct(e) {
//         e.preventDefault();

//         const form = e.target;
//         const formData = new FormData(form);

//         const productData = {
//             title: formData.get('title'),
//             description: formData.get('description'),
//             base_price: parseFloat(formData.get('base_price')),
//             status: formData.get('status')
//         };

//         try {
//             this.showLoading(true);
//             // Note: You'll need to implement the update product API endpoint
//             this.showNotification('Update product functionality coming soon', 'warning');
//             this.closeModal('edit-product-modal');

//         } catch (error) {
//             console.error('Error updating product:', error);
//             this.showNotification(`Failed to update product: ${error.message}`, 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     async deleteProduct(productId) {
//         if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
//             return;
//         }

//         try {
//             this.showLoading(true);
//             // Note: You'll need to implement the delete product API endpoint
//             this.showNotification('Delete product functionality coming soon', 'warning');

//         } catch (error) {
//             console.error('Error deleting product:', error);
//             this.showNotification(`Failed to delete product: ${error.message}`, 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     async showVariantsModal(productId) {
//         this.currentProductId = productId;
//         const container = document.getElementById('variants-container');
//         if (!container) return;

//         container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading variants...</p></div>';

//         try {
//             this.showLoading(true);
//             const response = await fetch(`${this.baseURL}/vendor/get/${productId}/`, {
//                 headers: this.getHeaders()
//             });

//             if (response.ok) {
//                 const productData = await response.json();
//                 const product = Array.isArray(productData) ? productData[0] : productData;
//                 this.renderVariants(product);
//                 this.showModal('variants-modal');
//             } else {
//                 throw new Error(`HTTP ${response.status}: ${await response.text()}`);
//             }
//         } catch (error) {
//             console.error('Error loading variants:', error);
//             this.showNotification(`Failed to load variants: ${error.message}`, 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     // renderVariants(product) {
//     //     const container = document.getElementById('variants-container');
//     //     if (!container) return;

//     //     const variants = product.variants || [];

//     //     if (variants.length === 0) {
//     //         container.innerHTML = this.getEmptyState('variants', 'No Variants Added', 'Add your first variant to start selling');
//     //         return;
//     //     }

//     //     container.innerHTML = variants.map(variant => {
//     //         // Generate variant name from attributes
//     //         const variantName = variant.attributes && variant.attributes.length > 0 
//     //             ? variant.attributes.map(attr => `${attr.value}`).join(' • ')
//     //             : variant.sku || 'Unnamed Variant';

//     //         return `
//     //             <div class="variant-item">
//     //                 <div class="variant-image">
//     //                     ${variant.images && variant.images.length > 0 ? 
//     //                         `<img src="${variant.images[0].image}" alt="${variantName}" class="variant-thumbnail">` :
//     //                         `<div class="variant-thumbnail-placeholder">
//     //                             <i class="fas fa-image"></i>
//     //                         </div>`
//     //                     }
//     //                 </div>
//     //                 <div class="variant-info">
//     //                     <h4 class="variant-name">${this.escapeHtml(variantName)}</h4>
//     //                     <div class="variant-details">
//     //                         <div class="variant-price">₹${parseFloat(variant.adjusted_price).toFixed(2)}</div>
//     //                         <div class="variant-stock ${variant.stock > 0 ? 'in-stock' : 'out-of-stock'}">
//     //                             ${variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
//     //                         </div>
//     //                         <div class="variant-status ${variant.is_active ? 'active' : 'inactive'}">
//     //                             ${variant.is_active ? 'Active' : 'Inactive'}
//     //                         </div>
//     //                     </div>
//     //                     <div class="variant-attributes">
//     //                         ${(variant.attributes || []).map(attr => 
//     //                             `<span class="attribute-tag">${this.escapeHtml(attr.attribute)}: ${this.escapeHtml(attr.value)}</span>`
//     //                         ).join('')}
//     //                     </div>
//     //                     ${variant.images && variant.images.length > 0 ? 
//     //                         `<div class="variant-images-preview">
//     //                             ${variant.images.slice(0, 4).map((img, index) => 
//     //                                 `<img src="${img.image}" alt="${img.alt_text || 'Variant image'}" 
//     //                                       class="variant-preview-img ${img.is_primary ? 'primary' : ''}"
//     //                                       title="${img.is_primary ? 'Primary image' : 'Variant image'}">`
//     //                             ).join('')}
//     //                             ${variant.images.length > 4 ? `<div class="more-images">+${variant.images.length - 4}</div>` : ''}
//     //                         </div>` : ''
//     //                     }
//     //                 </div>
//     //                 <div class="variant-actions">
//     //                     <button class="btn btn-secondary btn-sm" onclick="dashboard.editVariantModal(${variant.id})">
//     //                         <i class="fas fa-edit"></i> Edit
//     //                     </button>
//     //                     <button class="btn btn-danger btn-sm" onclick="dashboard.deleteVariant(${variant.id})">
//     //                         <i class="fas fa-trash"></i> Delete
//     //                     </button>
//     //                 </div>
//     //             </div>
//     //         `;
//     //     }).join('');
//     // }

// renderVariants(product) {
//     const container = document.getElementById('variants-container');
//     if (!container) return;

//     const variants = product.variants || [];

//     if (variants.length === 0) {
//         container.innerHTML = this.getEmptyState('variants', 'No Variants Added', 'Add your first variant to start selling');
//         return;
//     }

//     container.innerHTML = variants.map(variant => {
//         const variantName = variant.attributes && variant.attributes.length > 0 
//             ? variant.attributes.map(attr => `${attr.value}`).join(' - ')
//             : 'Unnamed Variant';

//         const primaryImage = variant.images && variant.images.length > 0 
//             ? variant.images.find(img => img.is_primary) || variant.images[0]
//             : null;

//         return `
//             <div class="variant-card-compact">
//                 <div class="variant-main-info">
//                     <div class="variant-image-compact">
//                         ${primaryImage ? 
//                             `<img src="${primaryImage.image}" alt="${variantName}" class="variant-thumb">` :
//                             `<div class="variant-thumb-placeholder">
//                                 <i class="fas fa-image"></i>
//                             </div>`
//                         }
//                     </div>

//                     <div class="variant-details-compact">
//                         <div class="variant-header-compact">
//                             <h4 class="variant-title-compact">${this.escapeHtml(variantName)}</h4>
//                             <div class="variant-price-compact">₹${parseFloat(variant.adjusted_price).toLocaleString('en-IN')}</div>
//                         </div>

//                         <div class="variant-meta-compact">
//                             <span class="stock-badge ${variant.stock > 0 ? 'in-stock' : 'out-of-stock'}">
//                                 ${variant.stock} in stock
//                             </span>
//                             <span class="status-badge ${variant.is_active ? 'active' : 'inactive'}">
//                                 ${variant.is_active ? 'Active' : 'Inactive'}
//                             </span>
//                         </div>

//                         <div class="variant-attributes-compact">
//                             ${(variant.attributes || []).map(attr => 
//                                 `<span class="attr-pill">
//                                     <strong>${this.escapeHtml(attr.attribute)}:</strong> ${this.escapeHtml(attr.value)}
//                                 </span>`
//                             ).join('')}
//                         </div>
//                     </div>
//                 </div>

//                 <div class="variant-actions-compact">
//                     <button class="btn btn-sm btn-outline" onclick="dashboard.editVariantModal(${variant.id})">
//                         <i class="fas fa-edit"></i>
//                     </button>
//                     <button class="btn btn-sm btn-danger-outline" onclick="dashboard.deleteVariant(${variant.id})">
//                         <i class="fas fa-trash"></i>
//                     </button>
//                 </div>
//             </div>
//         `;
//     }).join('');
// }


//     async showAddVariantModal() {
//         try {
//             this.showLoading(true);
//             console.log('🔍 Loading product for variant...');
//             console.log('📦 All products:', this.products);
//             console.log('🎯 Current product ID:', this.currentProductId);

//             const product = this.products.find(p => p.id === this.currentProductId);
//             console.log('📋 Product found:', product);

//             if (!product) {
//                 console.error('❌ Product not found for ID:', this.currentProductId);
//                 this.showNotification('Product not found', 'error');
//                 return;
//             }

//             let categoryId = product.category_id;

//             console.log('🔍 Loading attributes for category:', categoryId);

//             const response = await fetch(`${this.baseURL}/category/${categoryId}/attributes/`, {
//                 headers: this.getHeaders()
//             });

//             console.log('📊 Attributes API response:', response.status);

//             if (response.ok) {
//                 const attributesData = await response.json();
//                 this.currentProductAttributes = attributesData.attribute || [];
//                 console.log('✅ Loaded attributes:', this.currentProductAttributes);

//                 // Reset the form before rendering new fields
//                 this.resetAddVariantForm();
//                 this.renderAttributeFields();
//                 this.showModal('add-variant-modal');
//             } else {
//                 const errorText = await response.text();
//                 console.error('❌ Attributes API error:', errorText);
//                 throw new Error(`Failed to load attributes: HTTP ${response.status}`);
//             }
//         } catch (error) {
//             console.error('❌ Error loading attributes:', error);
//             this.showNotification(`❌ Failed to load attributes: ${error.message}`, 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     resetAddVariantForm() {
//         // Reset form fields
//         const form = document.getElementById('add-variant-form');
//         if (form) {
//             form.reset();
//         }

//         // Clear image previews
//         const previewContainer = document.getElementById('image-preview');
//         if (previewContainer) {
//             previewContainer.innerHTML = '';
//         }

//         // Clear file input
//         const fileInput = document.getElementById('variant-images');
//         if (fileInput) {
//             fileInput.value = '';
//         }

//         // Clear attribute fields container
//         const attributesContainer = document.getElementById('variant-attributes-container');
//         if (attributesContainer) {
//             attributesContainer.innerHTML = '';
//         }
//     }

//     renderAttributeFields() {
//         const container = document.getElementById('variant-attributes-container');
//         if (!container) return;

//         if (!this.currentProductAttributes || this.currentProductAttributes.length === 0) {
//             container.innerHTML = '<p class="empty-state">No attributes found for this category.</p>';
//             return;
//         }

//         container.innerHTML = this.currentProductAttributes.map(attr => `
//             <div class="attribute-field">
//                 <label class="form-label">${attr.name} ${attr.is_required ? '<span class="required">*</span>' : ''}</label>
//                 ${this.renderAttributeInput(attr)}
//             </div>
//         `).join('');
//     }

//     renderAttributeInput(attribute) {
//         if (attribute.values && attribute.values.length > 0) {
//             return `
//                 <select name="attr_${attribute.id}" class="form-select" ${attribute.is_required ? 'required' : ''}>
//                     <option value="">Select ${attribute.name}</option>
//                     ${attribute.values.map(value => 
//                         `<option value="${value.id}">${value.value}</option>`
//                     ).join('')}
//                 </select>
//             `;
//         }

//         switch (attribute.input_type) {
//             case 'text':
//                 return `<input type="text" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
//             case 'int':
//                 return `<input type="number" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
//             case 'decimal':
//                 return `<input type="number" step="0.01" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
//             case 'boolean':
//                 return `
//                     <select name="attr_${attribute.id}" class="form-select" ${attribute.is_required ? 'required' : ''}>
//                         <option value="">Select ${attribute.name}</option>
//                         <option value="true">Yes</option>
//                         <option value="false">No</option>
//                     </select>
//                 `;
//             default:
//                 return `<input type="text" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
//         }
//     }

//     async addVariant(e) {
//     e.preventDefault();

//     const form = e.target;
//     const formData = new FormData(form);

//     // Collect attribute values
//     const attribute_and_value = [];
//     this.currentProductAttributes.forEach(attr => {
//         const value = formData.get(`attr_${attr.id}`);
//         if (value) {
//             attribute_and_value.push({
//                 attribute_id: attr.id,
//                 value_id: parseInt(value)
//             });
//         }
//     });

//     console.log('🔍 Collected attributes:', attribute_and_value);

//     if (attribute_and_value.length === 0) {
//         this.showNotification('Please fill at least one attribute', 'error');
//         return;
//     }

//     // FIX: Properly get checkbox value
//     const isActiveCheckbox = document.getElementById('variant-active');
//     const isActive = isActiveCheckbox ? isActiveCheckbox.checked : false;

//     console.log('✅ Checkbox status:', isActive);

//     // Create the variant data object
//     const variantData = {
//         adjusted_price: parseFloat(formData.get('adjusted_price')) || 0,
//         stock: parseInt(formData.get('stock')) || 0,
//         attribute_and_value: attribute_and_value,
//         is_active: isActive, // Use the correct checkbox value
//         product_id: this.currentProductId
//     };

//     console.log('📦 Variant data to send:', variantData);

//     // Handle file uploads
//     const imageFiles = document.getElementById('variant-images').files;
//     const formDataToSend = new FormData();

//     // Append ALL data as individual form fields
//     formDataToSend.append('adjusted_price', variantData.adjusted_price);
//     formDataToSend.append('stock', variantData.stock);
//     formDataToSend.append('is_active', variantData.is_active);
//     formDataToSend.append('product_id', variantData.product_id);

//     // Append attribute data as JSON string
//     formDataToSend.append('attribute_and_value', JSON.stringify(variantData.attribute_and_value));

//     // Append images
//     for (let i = 0; i < imageFiles.length; i++) {
//         formDataToSend.append('images', imageFiles[i]);
//     }

//     // Debug: Log what we're sending
//     console.log('📤 Sending FormData:');
//     for (let pair of formDataToSend.entries()) {
//         console.log(pair[0] + ': ', pair[1]);
//     }

//     try {
//         this.showLoading(true);
//         const response = await fetch(`${this.baseURL}/add-variants/${this.currentProductId}/`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${ACCESS_TOKEN}`
//             },
//             body: formDataToSend
//         });

//         console.log('📊 API Response status:', response.status);

//         if (response.ok) {
//             const result = await response.json();
//             console.log('✅ Variant added successfully:', result);
//             this.showNotification('Variant added successfully!', 'success');
//             this.closeModal('add-variant-modal');
//             this.showVariantsModal(this.currentProductId);
//             // Reload products to update images
//             this.loadProducts();
//         } else {
//             const errorText = await response.text();
//             console.error('❌ API Error response:', errorText);
//             let errorMessage = `HTTP ${response.status}`;
//             try {
//                 const errorData = JSON.parse(errorText);
//                 errorMessage = errorData.message || errorData.detail || errorMessage;
//             } catch (e) {
//                 errorMessage = errorText || errorMessage;
//             }
//             throw new Error(errorMessage);
//         }
//     } catch (error) {
//         console.error('❌ Error adding variant:', error);
//         this.showNotification(`Failed to add variant: ${error.message}`, 'error');
//     } finally {
//         this.showLoading(false);
//     }
// }

//     async editVariantModal(variantId) {
//         try {
//             this.showLoading(true);

//             // Find the variant in the current product
//             let variant = null;
//             let product = null;

//             for (const p of this.products) {
//                 if (p.variants) {
//                     const foundVariant = p.variants.find(v => v.id === variantId);
//                     if (foundVariant) {
//                         variant = foundVariant;
//                         product = p;
//                         break;
//                     }
//                 }
//             }

//             if (!variant) {
//                 this.showNotification('Variant not found', 'error');
//                 return;
//             }

//             this.currentVariantId = variantId;
//             this.currentProductId = product.id;

//             // Populate the edit form
//             document.getElementById('edit-variant-price').value = variant.adjusted_price;
//             document.getElementById('edit-variant-stock').value = variant.stock;
//             document.getElementById('edit-variant-active').checked = variant.is_active;

//             // Display attributes as view-only
//             const attributesContainer = document.getElementById('edit-variant-attributes');
//             if (attributesContainer) {
//                 attributesContainer.innerHTML = (variant.attributes || [])
//                     .map(attr => `
//                         <div class="attribute-item">
//                             <strong>${this.escapeHtml(attr.attribute)}:</strong> 
//                             ${this.escapeHtml(attr.value)}
//                         </div>
//                     `).join('');
//             }

//             // Display existing images
//             const existingContainer = document.getElementById('existing-images');
//             existingContainer.innerHTML = '';
//             if (variant.images && variant.images.length > 0) {
//                 variant.images.forEach((img, index) => {
//                     const imgElement = document.createElement('div');
//                     imgElement.className = 'existing-image';
//                     imgElement.innerHTML = `
//                         <img src="${img.image}" alt="${img.alt_text || 'Variant image'}">
//                         <div class="image-info">
//                             <span class="image-status ${img.is_primary ? 'primary' : ''}">
//                                 ${img.is_primary ? 'Primary' : 'Secondary'}
//                             </span>
//                         </div>
//                         <button type="button" class="remove-image" onclick="dashboard.removeExistingImage(${variantId}, ${index})">
//                             <i class="fas fa-times"></i>
//                         </button>
//                     `;
//                     existingContainer.appendChild(imgElement);
//                 });
//             }

//             // Clear new image previews
//             document.getElementById('edit-image-preview').innerHTML = '';
//             document.getElementById('edit-variant-images').value = '';

//             this.showModal('edit-variant-modal');

//         } catch (error) {
//             console.error('Error opening edit variant modal:', error);
//             this.showNotification('Error loading variant details', 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     async removeExistingImage(variantId, imageIndex) {
//         if (!confirm('Are you sure you want to remove this image?')) {
//             return;
//         }

//         try {
//             this.showLoading(true);
//             // Note: You'll need to implement the delete image API endpoint
//             this.showNotification('Remove image functionality coming soon', 'warning');

//         } catch (error) {
//             console.error('Error removing image:', error);
//             this.showNotification(`Failed to remove image: ${error.message}`, 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     async editVariant(e) {
//         e.preventDefault();

//         const form = e.target;
//         const formData = new FormData(form);

//         const variantData = {
//             adjusted_price: parseFloat(formData.get('adjusted_price')) || 0,
//             stock: parseInt(formData.get('stock')) || 0,
//             is_active: formData.get('is_active') === 'on'
//         };

//         try {
//             this.showLoading(true);
//             // Note: You'll need to implement the update variant API endpoint
//             this.showNotification('Update variant functionality coming soon', 'warning');
//             this.closeModal('edit-variant-modal');

//         } catch (error) {
//             console.error('Error updating variant:', error);
//             this.showNotification(`Failed to update variant: ${error.message}`, 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     async deleteVariant(variantId) {
//         if (!confirm('Are you sure you want to delete this variant? This action cannot be undone.')) {
//             return;
//         }

//         try {
//             this.showLoading(true);
//             // Note: You'll need to implement the delete variant API endpoint
//             this.showNotification('Delete variant functionality coming soon', 'warning');

//         } catch (error) {
//             console.error('Error deleting variant:', error);
//             this.showNotification(`Failed to delete variant: ${error.message}`, 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     filterProducts(searchTerm) {
//         const filtered = this.products.filter(product => 
//             product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
//         );
//         this.renderProducts(filtered);
//     }

//     filterProductsByStatus(status) {
//         const filtered = status ? this.products.filter(product => product.status === status) : this.products;
//         this.renderProducts(filtered);
//     }

//     updateDashboardStats() {
//         const totalProducts = this.products.length;
//         const totalStock = this.products.reduce((sum, product) => 
//             sum + (product.variants?.reduce((vSum, variant) => vSum + (variant.stock || 0), 0) || 0), 0);
//         const activeProducts = this.products.filter(p => p.status === 'active').length;
//         const totalRevenue = this.products.reduce((sum, product) => 
//             sum + (parseFloat(product.base_price) * (product.variants?.reduce((vSum, variant) => vSum + (variant.stock || 0), 0) || 0)), 0);

//         document.getElementById('total-products').textContent = totalProducts;
//         document.getElementById('products-count').textContent = totalProducts;

//         // Update other stats
//         const statCards = document.querySelectorAll('.stat-card');
//         if (statCards[1]) statCards[1].querySelector('h3').textContent = totalStock;
//         if (statCards[2]) statCards[2].querySelector('h3').textContent = activeProducts;
//         if (statCards[3]) statCards[3].querySelector('h3').textContent = `₹${totalRevenue.toFixed(2)}`;

//         this.updateRecentProducts();
//     }

//     updateRecentProducts() {
//         const container = document.getElementById('recent-products');
//         if (!container) return;

//         const recentProducts = this.products.slice(0, 5);

//         if (recentProducts.length === 0) {
//             container.innerHTML = '<div class="empty-state"><p>No products yet</p></div>';
//             return;
//         }

//         container.innerHTML = recentProducts.map(product => `
//             <div class="activity-item">
//                 <div class="activity-icon">
//                     <i class="fas fa-box"></i>
//                 </div>
//                 <div class="activity-content">
//                     <div class="activity-title">${this.escapeHtml(product.title)}</div>
//                     <div class="activity-description">₹${parseFloat(product.base_price).toFixed(2)} • ${product.status}</div>
//                 </div>
//                 <div class="activity-time">${new Date(product.created_at).toLocaleDateString()}</div>
//             </div>
//         `).join('');
//     }

//     updateProductsCount() {
//         const count = this.products.length;
//         const countElement = document.getElementById('products-count');
//         if (countElement) {
//             countElement.textContent = count;
//         }
//     }

//     getHeaders() {
//         return {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${ACCESS_TOKEN}`
//         };
//     }

//     handleTokenExpired() {
//         this.showNotification('Access token expired. Please update your tokens.', 'error');
//     }

//     showModal(modalId) {
//         const modal = document.getElementById(modalId);
//         if (modal) {
//             modal.style.display = 'block';
//         }
//     }

//     closeModal(modalId) {
//         const modal = document.getElementById(modalId);
//         if (modal) {
//             modal.style.display = 'none';
//         }
//     }

//     closeAllModals() {
//         document.querySelectorAll('.modal').forEach(modal => {
//             modal.style.display = 'none';
//         });
//     }

//     showLoading(show) {
//         const overlay = document.getElementById('loading-overlay');
//         if (overlay) {
//             overlay.style.display = show ? 'block' : 'none';
//         }
//     }

//     showNotification(message, type = 'success') {
//         const container = document.getElementById('notification-container');
//         if (!container) return;

//         const notification = document.createElement('div');
//         notification.className = `notification ${type}`;
//         notification.innerHTML = `
//             <div class="notification-content">
//                 <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
//                 <span>${message}</span>
//             </div>
//         `;

//         container.appendChild(notification);

//         setTimeout(() => {
//             notification.remove();
//         }, 5000);
//     }

//     getEmptyState(type, title, message) {
//         const icons = {
//             products: 'fa-box-open',
//             variants: 'fa-list',
//             general: 'fa-inbox'
//         };

//         return `
//             <div class="empty-state">
//                 <i class="fas ${icons[type] || icons.general}"></i>
//                 <h3>${title}</h3>
//                 <p>${message}</p>
//                 ${type === 'products' ? 
//                     '<button class="btn btn-primary" onclick="dashboard.switchPage(\'add-product\')">Add Your First Product</button>' : 
//                     '<button class="btn btn-primary" onclick="dashboard.showAddVariantModal()">Add Your First Variant</button>'
//                 }
//             </div>
//         `;
//     }

//     getErrorState(type, message) {
//         return `
//             <div class="empty-state">
//                 <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
//                 <h3>Error Loading ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
//                 <p>${message}</p>
//                 <button class="btn btn-secondary" onclick="dashboard.loadProducts()">Try Again</button>
//             </div>
//         `;
//     }

//     logout() {
//         localStorage.removeItem('vendor_access_token');
//         localStorage.removeItem('vendor_refresh_token');
//         this.showNotification('Logged out successfully', 'success');
//         setTimeout(() => {
//             location.reload();
//         }, 1000);
//     }

//     escapeHtml(unsafe) {
//         if (!unsafe) return '';
//         return unsafe
//             .replace(/&/g, "&amp;")
//             .replace(/</g, "&lt;")
//             .replace(/>/g, "&gt;")
//             .replace(/"/g, "&quot;")
//             .replace(/'/g, "&#039;");
//     }
// }

// // Initialize dashboard when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     window.dashboard = new VendorDashboard();
// });












// CONSTANT TOKENS - PASTE YOUR TOKENS HERE
const ACCESS_TOKEN =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYzMTM3NDgxLCJpYXQiOjE3NjMxMjMwODEsImp0aSI6ImYxNmY0MWQwMTVlMjQ3NWY4NGY0ZjBkZjVmMDZiOTMzIiwidXNlcl9pZCI6IjEifQ.OMpacEmnECKba8v3Npy_7Qxt6B0TilOaBNfOHA8vJGc";
const REFRESH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzIwOTQ4MSwiaWF0IjoxNzYzMTIzMDgxLCJqdGkiOiJmOGY5NDk4MzVmMzI0MjE3OTJkOGQyOTkwNWIxY2MzZSIsInVzZXJfaWQiOiIxIn0.6Sti4nO48_KHc4xJgNhNDVMsXQa5zfxb-Gv4hBg7-v4";

class VendorDashboard {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/product'; // Update with your Django server URL
        this.currentProductId = null;
        this.currentVariantId = null;
        this.categories = [];
        this.products = [];
        this.currentProductAttributes = [];

        this.init();
    }

    init() {
        if (!ACCESS_TOKEN || !REFRESH_TOKEN) {
            this.showTokenWarning();
            return;
        }

        this.bindEvents();
        this.loadCategories();
        this.loadProducts();
        this.updateDashboardStats();
    }

    showTokenWarning() {
        const warningHTML = `
            <div id="token-warning" class="modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 style="color: #e74c3c;">⚠️ Tokens Required</h2>
                    </div>
                    <div class="modal-body">
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                            <h4 style="color: #856404; margin-bottom: 0.5rem;">How to get tokens:</h4>
                            <ol style="color: #856404; margin-left: 1.5rem;">
                                <li>Get tokens from Postman API response</li>
                                <li>Open vendor-dashboard.js file</li>
                                <li>Find ACCESS_TOKEN and REFRESH_TOKEN constants at the top</li>
                                <li>Paste your tokens between the quotes</li>
                                <li>Save the file and refresh this page</li>
                            </ol>
                        </div>
                        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 1rem;">
                            <h4 style="color: #495057; margin-bottom: 0.5rem;">Current Token Status:</h4>
                            <p style="color: #6c757d; margin: 0.25rem 0;">
                                <strong>ACCESS_TOKEN:</strong> 
                                <span style="color: ${ACCESS_TOKEN ? '#28a745' : '#dc3545'}">
                                    ${ACCESS_TOKEN ? '✓ Set' : '✗ Missing'}
                                </span>
                            </p>
                            <p style="color: #6c757d; margin: 0.25rem 0;">
                                <strong>REFRESH_TOKEN:</strong> 
                                <span style="color: ${REFRESH_TOKEN ? '#28a745' : '#dc3545'}">
                                    ${REFRESH_TOKEN ? '✓ Set' : '✗ Missing'}
                                </span>
                            </p>
                        </div>
                        <div class="form-actions" style="margin-top: 1.5rem;">
                            <button onclick="location.reload()" class="btn btn-primary">Refresh After Adding Tokens</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', warningHTML);
    }

    bindEvents() {
        console.log('🔧 Binding events...');

        // Navigation - Menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            if (item.dataset.page) {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('📱 Menu item clicked:', item.dataset.page);
                    this.switchPage(item.dataset.page);
                });
            }
        });

        // Add Product button in products section
        const addProductBtn = document.querySelector('.btn-primary[data-page="add-product"]');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('➕ Add Product button clicked');
                this.switchPage('add-product');
            });
        }

        // Back to Products button in add-product section  
        const backToProductsBtn = document.querySelector('.btn-secondary[data-page="products"]');
        if (backToProductsBtn) {
            backToProductsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('⬅️ Back to Products button clicked');
                this.switchPage('products');
            });
        }

        // View All link in dashboard
        const viewAllLink = document.querySelector('.view-all[data-page="products"]');
        if (viewAllLink) {
            viewAllLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('👀 View All link clicked');
                this.switchPage('products');
            });
        }

        // Forms
        document.getElementById('add-product-form')?.addEventListener('submit', (e) => this.addProduct(e));
        document.getElementById('add-variant-form')?.addEventListener('submit', (e) => this.addVariant(e));
        document.getElementById('edit-product-form')?.addEventListener('submit', (e) => this.editProduct(e));
        document.getElementById('edit-variant-form')?.addEventListener('submit', (e) => this.editVariant(e));

        // Add this line with the other event listeners
        document.querySelector('.close-variant-modal')?.addEventListener('click', () => this.closeModal('add-variant-modal'));

        // Modal controls
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => this.closeAllModals());
        });

        // Buttons
        document.getElementById('refresh-products')?.addEventListener('click', () => this.loadProducts());
        document.getElementById('add-variant-btn')?.addEventListener('click', () => this.showAddVariantModal());
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Close modal buttons
        document.querySelector('.close-edit-variant-modal')?.addEventListener('click', () => this.closeModal('edit-variant-modal'));
        document.querySelector('.close-edit-product-modal')?.addEventListener('click', () => this.closeModal('edit-product-modal'));

        // Search and filter
        document.getElementById('search-products')?.addEventListener('input', (e) => this.filterProducts(e.target.value));
        document.getElementById('status-filter')?.addEventListener('change', (e) => this.filterProductsByStatus(e.target.value));

        // File upload
        this.setupFileUpload();
        this.setupEditFileUpload();

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        console.log('✅ All events bound successfully');
    }

    setupFileUpload() {
        const primaryUploadArea = document.getElementById('primary-image-upload-area');
        const additionalUploadArea = document.getElementById('additional-images-upload-area');
        const primaryFileInput = document.getElementById('primary-image');
        const additionalFileInput = document.getElementById('additional-images');

        // Primary image upload
        if (primaryUploadArea && primaryFileInput) {
            primaryUploadArea.addEventListener('click', () => primaryFileInput.click());
            this.setupDragAndDrop(primaryUploadArea, primaryFileInput, 'primary');
        }

        // Additional images upload
        if (additionalUploadArea && additionalFileInput) {
            additionalUploadArea.addEventListener('click', () => additionalFileInput.click());
            this.setupDragAndDrop(additionalUploadArea, additionalFileInput, 'additional');
        }
    }

    setupEditFileUpload() {
        const primaryUploadArea = document.getElementById('edit-primary-image-upload-area');
        const additionalUploadArea = document.getElementById('edit-additional-images-upload-area');
        const primaryFileInput = document.getElementById('edit-primary-image');
        const additionalFileInput = document.getElementById('edit-additional-images');

        // Primary image upload
        if (primaryUploadArea && primaryFileInput) {
            primaryUploadArea.addEventListener('click', () => primaryFileInput.click());
            this.setupDragAndDrop(primaryUploadArea, primaryFileInput, 'edit-primary');
        }

        // Additional images upload
        if (additionalUploadArea && additionalFileInput) {
            additionalUploadArea.addEventListener('click', () => additionalFileInput.click());
            this.setupDragAndDrop(additionalUploadArea, additionalFileInput, 'edit-additional');
        }
    }

    setupDragAndDrop(uploadArea, fileInput, type) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.background = '';
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                this.previewImages(fileInput.files, type);
            }
        });

        fileInput.addEventListener('change', (e) => {
            this.previewImages(e.target.files, type);
        });
    }

    previewImages(files, type) {
        let previewContainer;

        switch (type) {
            case 'primary':
                previewContainer = document.getElementById('primary-image-preview');
                break;
            case 'additional':
                previewContainer = document.getElementById('additional-images-preview');
                break;
            case 'edit-primary':
                previewContainer = document.getElementById('edit-primary-image-preview');
                break;
            case 'edit-additional':
                previewContainer = document.getElementById('edit-additional-images-preview');
                break;
            default:
                return;
        }

        if (!previewContainer) return;

        // Clear previous previews for primary images (only one allowed)
        if (type === 'primary' || type === 'edit-primary') {
            previewContainer.innerHTML = '';
        }

        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.createElement('div');
                    preview.className = 'preview-image';
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                        <button type="button" class="remove-image" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    previewContainer.appendChild(preview);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    switchPage(page) {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.toggle('active', section.id === `${page}-section`);
        });

        if (page === 'products') {
            this.loadProducts();
        } else if (page === 'dashboard') {
            this.updateDashboardStats();
        }
    }

    async loadCategories() {
        try {
            console.log("Loading categories...");
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/categories/leaf-nodes/`, {
                headers: this.getHeaders()
            });
            console.log("Categories called.")
            if (response.ok) {
                const data = await response.json();
                console.log(data)
                this.categories = Array.isArray(data) ? data : [];
                this.populateCategoryDropdown();
                this.showNotification('Categories loaded successfully', 'success');

            } else if (response.status === 401) {
                this.handleTokenExpired();
            } else {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showNotification(`Failed to load categories: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    populateCategoryDropdown() {
        const dropdown = document.getElementById('product-category');
        if (!dropdown) return;

        dropdown.innerHTML = '<option value="">Select Category</option>';

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            dropdown.appendChild(option);
        });
    }

    async loadProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;

        container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading products...</p></div>';

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/vendor/get/products/`, {
                headers: this.getHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.products = Array.isArray(data) ? data : [];
                this.renderProducts();
                this.updateProductsCount();
            } else if (response.status === 401) {
                this.handleTokenExpired();
            } else {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification(`Failed to load products: ${error.message}`, 'error');
            container.innerHTML = this.getErrorState('products', error.message);
        } finally {
            this.showLoading(false);
        }
    }

    renderProducts(products = this.products) {
        const container = document.getElementById('products-container');
        if (!container) return;

        if (!products || products.length === 0) {
            container.innerHTML = this.getEmptyState('products', 'No products found', 'Start by adding your first product');
            return;
        }

        container.innerHTML = products.map(product => {
            const variantCount = product.variants?.length || 0;
            const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;
            const categoryName = product.category?.[0]?.name || 'Uncategorized';

            // Get the primary image from variants
            let productImage = null;
            if (product.variants && product.variants.length > 0) {
                for (let variant of product.variants) {
                    if (variant.images && variant.images.length > 0) {
                        // Find primary image or use first image
                        const primaryImage = variant.images.find(img => img.is_primary) || variant.images[0];
                        if (primaryImage) {
                            productImage = primaryImage.image;
                            break;
                        }
                    }
                }
            }

            return `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image">
                        ${productImage ?
                    `<img src="${productImage}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
                    `<i class="fas fa-box-open"></i>`
                }
                    </div>
                    <div class="product-content">
                        <div class="product-header">
                            <div>
                                <h3 class="product-title">${this.escapeHtml(product.title)}</h3>
                                <div class="product-price">₹${parseFloat(product.base_price).toFixed(2)}</div>
                                <small style="color: var(--secondary-color);">${categoryName}</small>
                            </div>
                            <span class="product-status status-${product.status}">${product.status}</span>
                        </div>
                        <p class="product-description">${this.escapeHtml(product.description)}</p>
                        <div class="product-meta">
                            <small>${variantCount} variant${variantCount !== 1 ? 's' : ''}</small>
                            <small>Stock: ${totalStock}</small>
                            <small>Created: ${new Date(product.created_at).toLocaleDateString()}</small>
                        </div>
                        <div class="product-actions">
                            <button class="btn btn-secondary" onclick="dashboard.editProductModal(${product.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-primary" onclick="dashboard.showVariantsModal(${product.id})">
                                <i class="fas fa-list"></i> Variants
                            </button>
                            <button class="btn btn-danger" onclick="dashboard.deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async addProduct(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const productData = {
            title: formData.get('title'),
            description: formData.get('description'),
            base_price: parseFloat(formData.get('base_price')),
            category_id: parseInt(formData.get('category_id'))
        };

        if (!productData.title || !productData.description || !productData.base_price || !productData.category_id) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/add-product/`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Product added successfully! Now add variants.', 'success');
                form.reset();
                this.switchPage('products');
                this.loadProducts();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            this.showNotification(`Failed to add product: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async editProductModal(productId) {
        try {
            this.showLoading(true);
            const product = this.products.find(p => p.id === productId);
            if (!product) {
                this.showNotification('Product not found', 'error');
                return;
            }

            // Populate form with product data
            document.getElementById('edit-product-title').value = product.title;
            document.getElementById('edit-product-price').value = product.base_price;
            document.getElementById('edit-product-description').value = product.description;
            document.getElementById('edit-product-status').value = product.status;

            this.currentProductId = productId;
            this.showModal('edit-product-modal');
        } catch (error) {
            console.error('Error opening edit product modal:', error);
            this.showNotification('Error loading product details', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async editProduct(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const productData = {
            title: formData.get('title'),
            description: formData.get('description'),
            base_price: parseFloat(formData.get('base_price')),
            status: formData.get('status')
        };

        if (!productData.title || !productData.description || !productData.base_price || !productData.status) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/update/product/${this.currentProductId}/`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Product updated successfully!', 'success');
                this.closeModal('edit-product-modal');
                this.loadProducts();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            this.showNotification(`Failed to update product: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/delete/product/${productId}/`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (response.ok) {
                this.showNotification('Product deleted successfully!', 'success');
                this.loadProducts();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification(`Failed to delete product: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async showVariantsModal(productId) {
        this.currentProductId = productId;
        const container = document.getElementById('variants-container');
        if (!container) return;

        container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading variants...</p></div>';

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/vendor/get/${productId}/`, {
                headers: this.getHeaders()
            });

            if (response.ok) {
                const productData = await response.json();
                const product = Array.isArray(productData) ? productData[0] : productData;
                this.renderVariants(product);
                this.showModal('variants-modal');
            } else {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
        } catch (error) {
            console.error('Error loading variants:', error);
            this.showNotification(`Failed to load variants: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderVariants(product) {
        const container = document.getElementById('variants-container');
        if (!container) return;

        const variants = product.variants || [];

        if (variants.length === 0) {
            container.innerHTML = this.getEmptyState('variants', 'No Variants Added', 'Add your first variant to start selling');
            return;
        }

        container.innerHTML = variants.map(variant => {
            const variantName = variant.attributes && variant.attributes.length > 0
                ? variant.attributes.map(attr => `${attr.value}`).join(' - ')
                : 'Unnamed Variant';

            const primaryImage = variant.images && variant.images.length > 0
                ? variant.images.find(img => img.is_primary) || variant.images[0]
                : null;

            return `
                <div class="variant-card-compact">
                    <div class="variant-main-info">
                        <div class="variant-image-compact">
                            ${primaryImage ?
                    `<img src="${primaryImage.image}" alt="${variantName}" class="variant-thumb">` :
                    `<div class="variant-thumb-placeholder">
                                    <i class="fas fa-image"></i>
                                </div>`
                }
                        </div>
                        
                        <div class="variant-details-compact">
                            <div class="variant-header-compact">
                                <h4 class="variant-title-compact">${this.escapeHtml(variantName)}</h4>
                                <div class="variant-price-compact">₹${parseFloat(variant.adjusted_price).toLocaleString('en-IN')}</div>
                            </div>
                            
                            <div class="variant-meta-compact">
                                <span class="stock-badge ${variant.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                                    ${variant.stock} in stock
                                </span>
                                <span class="status-badge ${variant.is_active ? 'active' : 'inactive'}">
                                    ${variant.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            
                            <div class="variant-attributes-compact">
                                ${(variant.attributes || []).map(attr =>
                    `<span class="attr-pill">
                                        <strong>${this.escapeHtml(attr.attribute)}:</strong> ${this.escapeHtml(attr.value)}
                                    </span>`
                ).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="variant-actions-compact">
                        <button class="btn btn-sm btn-outline" onclick="dashboard.editVariantModal(${variant.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger-outline" onclick="dashboard.deleteVariant(${variant.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async showAddVariantModal() {
        try {
            this.showLoading(true);
            const product = this.products.find(p => p.id === this.currentProductId);

            if (!product) {
                this.showNotification('Product not found', 'error');
                return;
            }

            let categoryId = product.category_id;

            const response = await fetch(`${this.baseURL}/category/${categoryId}/attributes/`, {
                headers: this.getHeaders()
            });

            if (response.ok) {
                const attributesData = await response.json();
                this.currentProductAttributes = attributesData.attribute || [];

                // Reset the form before rendering new fields
                this.resetAddVariantForm();
                this.renderAttributeFields();
                this.showModal('add-variant-modal');
            } else {
                const errorText = await response.text();
                throw new Error(`Failed to load attributes: HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error loading attributes:', error);
            this.showNotification(`Failed to load attributes: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    resetAddVariantForm() {
        // Reset form fields
        const form = document.getElementById('add-variant-form');
        if (form) {
            form.reset();
        }

        // Clear image previews
        document.getElementById('primary-image-preview').innerHTML = '';
        document.getElementById('additional-images-preview').innerHTML = '';

        // Clear file inputs
        document.getElementById('primary-image').value = '';
        document.getElementById('additional-images').value = '';

        // Clear attribute fields container
        const attributesContainer = document.getElementById('variant-attributes-container');
        if (attributesContainer) {
            attributesContainer.innerHTML = '';
        }
    }

    renderAttributeFields() {
        const container = document.getElementById('variant-attributes-container');
        if (!container) return;

        if (!this.currentProductAttributes || this.currentProductAttributes.length === 0) {
            container.innerHTML = '<p class="empty-state">No attributes found for this category.</p>';
            return;
        }

        container.innerHTML = this.currentProductAttributes.map(attr => `
            <div class="attribute-field">
                <label class="form-label">${attr.name} ${attr.is_required ? '<span class="required">*</span>' : ''}</label>
                ${this.renderAttributeInput(attr)}
            </div>
        `).join('');
    }

    renderAttributeInput(attribute) {
        if (attribute.values && attribute.values.length > 0) {
            return `
                <select name="attr_${attribute.id}" class="form-select" ${attribute.is_required ? 'required' : ''}>
                    <option value="">Select ${attribute.name}</option>
                    ${attribute.values.map(value =>
                `<option value="${value.id}">${value.value}</option>`
            ).join('')}
                </select>
            `;
        }

        switch (attribute.input_type) {
            case 'text':
                return `<input type="text" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
            case 'int':
                return `<input type="number" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
            case 'decimal':
                return `<input type="number" step="0.01" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
            case 'boolean':
                return `
                    <select name="attr_${attribute.id}" class="form-select" ${attribute.is_required ? 'required' : ''}>
                        <option value="">Select ${attribute.name}</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                `;
            default:
                return `<input type="text" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
        }
    }

    async addVariant(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        // Collect attribute values
        const attribute_and_value = [];
        this.currentProductAttributes.forEach(attr => {
            const value = formData.get(`attr_${attr.id}`);
            if (value) {
                attribute_and_value.push({
                    attribute_id: attr.id,
                    value_id: parseInt(value)
                });
            }
        });

        console.log('🔍 Collected attributes:', attribute_and_value);

        if (attribute_and_value.length === 0) {
            this.showNotification('Please fill at least one attribute', 'error');
            return;
        }

        // Get checkbox value
        const isActiveCheckbox = document.getElementById('variant-active');
        const isActive = isActiveCheckbox ? isActiveCheckbox.checked : false;

        // Get image files
        const primaryImageFile = document.getElementById('primary-image').files[0];
        const additionalImageFiles = document.getElementById('additional-images').files;

        if (!primaryImageFile) {
            this.showNotification('Primary image is required', 'error');
            return;
        }

        // Create the variant data object
        const variantData = {
            adjusted_price: parseFloat(formData.get('adjusted_price')) || 0,
            stock: parseInt(formData.get('stock')) || 0,
            attribute_and_value: attribute_and_value,
            is_active: isActive,
            product_id: this.currentProductId
        };

        // Handle file uploads
        const formDataToSend = new FormData();

        // Append ALL data as individual form fields
        formDataToSend.append('adjusted_price', variantData.adjusted_price);
        formDataToSend.append('stock', variantData.stock);
        formDataToSend.append('is_active', variantData.is_active);
        formDataToSend.append('product_id', variantData.product_id);

        // Append attribute data as JSON string
        formDataToSend.append('attribute_and_value', JSON.stringify(variantData.attribute_and_value));

        // Append primary image
        formDataToSend.append('images', primaryImageFile);

        // Append additional images
        for (let i = 0; i < additionalImageFiles.length; i++) {
            formDataToSend.append('images', additionalImageFiles[i]);
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/add-variants/${this.currentProductId}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                },
                body: formDataToSend
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Variant added successfully!', 'success');
                this.closeModal('add-variant-modal');
                this.showVariantsModal(this.currentProductId);
                // Reload products to update images
                this.loadProducts();
            } else {
                const errorText = await response.text();
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.detail || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error adding variant:', error);
            this.showNotification(`Failed to add variant: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async editVariantModal(variantId) {
        try {
            this.showLoading(true);

            // Find the variant in the current product
            let variant = null;
            let product = null;

            for (const p of this.products) {
                if (p.variants) {
                    const foundVariant = p.variants.find(v => v.id === variantId);
                    if (foundVariant) {
                        variant = foundVariant;
                        product = p;
                        break;
                    }
                }
            }

            if (!variant) {
                this.showNotification('Variant not found', 'error');
                return;
            }

            this.currentVariantId = variantId;
            this.currentProductId = product.id;

            // Populate the edit form
            document.getElementById('edit-variant-price').value = variant.adjusted_price;
            document.getElementById('edit-variant-stock').value = variant.stock;
            document.getElementById('edit-variant-active').checked = variant.is_active;

            // Display attributes as view-only
            const attributesContainer = document.getElementById('edit-variant-attributes');
            if (attributesContainer) {
                attributesContainer.innerHTML = (variant.attributes || [])
                    .map(attr => `
                        <div class="attribute-item">
                            <strong>${this.escapeHtml(attr.attribute)}:</strong> 
                            ${this.escapeHtml(attr.value)}
                        </div>
                    `).join('');
            }

            // Display existing images
            const existingContainer = document.getElementById('existing-images');
            existingContainer.innerHTML = '';
            if (variant.images && variant.images.length > 0) {
                variant.images.forEach((img, index) => {
                    const imgElement = document.createElement('div');
                    imgElement.className = 'existing-image';
                    imgElement.innerHTML = `
                        <img src="${img.image}" alt="${img.alt_text || 'Variant image'}">
                        <div class="image-info">
                            <span class="image-status ${img.is_primary ? 'primary' : ''}">
                                ${img.is_primary ? 'Primary' : 'Secondary'}
                            </span>
                        </div>
                        <button type="button" class="remove-image" onclick="dashboard.removeExistingImage(${variantId}, ${img.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    existingContainer.appendChild(imgElement);
                });
            }

            // Clear new image previews
            document.getElementById('edit-primary-image-preview').innerHTML = '';
            document.getElementById('edit-additional-images-preview').innerHTML = '';
            document.getElementById('edit-primary-image').value = '';
            document.getElementById('edit-additional-images').value = '';

            this.showModal('edit-variant-modal');

        } catch (error) {
            console.error('Error opening edit variant modal:', error);
            this.showNotification('Error loading variant details', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async removeExistingImage(variantId, imageId) {
        if (!confirm('Are you sure you want to remove this image?')) {
            return;
        }

        try {
            this.showLoading(true);
            // Note: You'll need to implement the delete image API endpoint
            this.showNotification('Remove image functionality coming soon', 'warning');

        } catch (error) {
            console.error('Error removing image:', error);
            this.showNotification(`Failed to remove image: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async editVariant(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const variantData = {
        adjusted_price: parseFloat(formData.get('adjusted_price')) || 0,
        stock: parseInt(formData.get('stock')) || 0,
        is_active: formData.get('is_active') === 'on'
    };

    console.log('📦 Variant data to update:', variantData);

    // Get new image files
    const primaryImageFile = document.getElementById('edit-primary-image').files[0];
    const additionalImageFiles = document.getElementById('edit-additional-images').files;

    console.log('🖼️ Image files:', {
        primary: primaryImageFile,
        additional: additionalImageFiles.length
    });

    try {
        this.showLoading(true);
        
        // Prepare FormData for the request
        const formDataToSend = new FormData();
        formDataToSend.append('adjusted_price', variantData.adjusted_price);
        formDataToSend.append('stock', variantData.stock);
        formDataToSend.append('is_active', variantData.is_active);
        
        // Append new images if provided
        if (primaryImageFile) {
            formDataToSend.append('images', primaryImageFile);
        }
        for (let i = 0; i < additionalImageFiles.length; i++) {
            formDataToSend.append('images', additionalImageFiles[i]);
        }

        // Debug: Log what we're sending
        console.log('📤 Sending FormData:');
        for (let pair of formDataToSend.entries()) {
            console.log(pair[0] + ': ', pair[1]);
        }

        const response = await fetch(`${this.baseURL}/update/variant/${this.currentProductId}/${this.currentVariantId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: formDataToSend
        });

        console.log('📊 Update response status:', response.status);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Update successful:', result);
            this.showNotification('Variant updated successfully!', 'success');
            this.closeModal('edit-variant-modal');
            this.showVariantsModal(this.currentProductId);
            this.loadProducts();
        } else {
            // Get the detailed error from backend
            const errorData = await response.json();
            console.error('❌ Backend validation errors:', errorData["errors"]);
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error updating variant:', error);
        this.showNotification(`Failed to update variant: ${error.message}`, 'error');
    } finally {
        this.showLoading(false);
    }
}

    async deleteVariant(variantId) {
        if (!confirm('Are you sure you want to delete this variant? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/delete/variant/${this.currentProductId}/${variantId}/`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (response.ok) {
                this.showNotification('Variant deleted successfully!', 'success');
                this.showVariantsModal(this.currentProductId);
                this.loadProducts();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting variant:', error);
            this.showNotification(`Failed to delete variant: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    filterProducts(searchTerm) {
        const filtered = this.products.filter(product =>
            product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.renderProducts(filtered);
    }

    filterProductsByStatus(status) {
        const filtered = status ? this.products.filter(product => product.status === status) : this.products;
        this.renderProducts(filtered);
    }

    updateDashboardStats() {
        const totalProducts = this.products.length;
        const totalStock = this.products.reduce((sum, product) =>
            sum + (product.variants?.reduce((vSum, variant) => vSum + (variant.stock || 0), 0) || 0), 0);
        const activeProducts = this.products.filter(p => p.status === 'active').length;
        const totalRevenue = this.products.reduce((sum, product) =>
            sum + (parseFloat(product.base_price) * (product.variants?.reduce((vSum, variant) => vSum + (variant.stock || 0), 0) || 0)), 0);

        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('products-count').textContent = totalProducts;

        // Update other stats
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards[1]) statCards[1].querySelector('h3').textContent = totalStock;
        if (statCards[2]) statCards[2].querySelector('h3').textContent = activeProducts;
        if (statCards[3]) statCards[3].querySelector('h3').textContent = `₹${totalRevenue.toFixed(2)}`;

        this.updateRecentProducts();
    }

    updateRecentProducts() {
        const container = document.getElementById('recent-products');
        if (!container) return;

        const recentProducts = this.products.slice(0, 5);

        if (recentProducts.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No products yet</p></div>';
            return;
        }

        container.innerHTML = recentProducts.map(product => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-box"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${this.escapeHtml(product.title)}</div>
                    <div class="activity-description">₹${parseFloat(product.base_price).toFixed(2)} • ${product.status}</div>
                </div>
                <div class="activity-time">${new Date(product.created_at).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    updateProductsCount() {
        const count = this.products.length;
        const countElement = document.getElementById('products-count');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        };
    }

    handleTokenExpired() {
        this.showNotification('Access token expired. Please update your tokens.', 'error');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'block' : 'none';
        }
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    getEmptyState(type, title, message) {
        const icons = {
            products: 'fa-box-open',
            variants: 'fa-list',
            general: 'fa-inbox'
        };

        return `
            <div class="empty-state">
                <i class="fas ${icons[type] || icons.general}"></i>
                <h3>${title}</h3>
                <p>${message}</p>
                ${type === 'products' ?
                '<button class="btn btn-primary" onclick="dashboard.switchPage(\'add-product\')">Add Your First Product</button>' :
                '<button class="btn btn-primary" onclick="dashboard.showAddVariantModal()">Add Your First Variant</button>'
            }
            </div>
        `;
    }

    getErrorState(type, message) {
        return `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                <h3>Error Loading ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                <p>${message}</p>
                <button class="btn btn-secondary" onclick="dashboard.loadProducts()">Try Again</button>
            </div>
        `;
    }

    logout() {
        localStorage.removeItem('vendor_access_token');
        localStorage.removeItem('vendor_refresh_token');
        this.showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new VendorDashboard();
});