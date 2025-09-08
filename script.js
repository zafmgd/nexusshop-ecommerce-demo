document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const productListEl = document.getElementById('product-list');
    const sortSelect = document.getElementById('sort-select');
    const searchInput = document.getElementById('search-input'); // YENİ: Arama input'u
    const cartButton = document.getElementById('cart-button');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsEl = document.getElementById('cart-items');
    const cartCountEl = document.getElementById('cart-count');
    const cartSubtotalPriceEl = document.getElementById('cart-subtotal-price');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const closeCartButton = document.getElementById('close-cart');
    const checkoutButton = document.getElementById('checkout-button');
    
    const paymentModalOverlay = document.getElementById('payment-modal-overlay');
    const closePaymentModalButton = document.getElementById('close-payment-modal');
    const cancelPaymentButton = document.getElementById('cancel-payment');
    const confirmPaymentButton = document.getElementById('confirm-payment');
    const paymentForm = document.getElementById('payment-form');

    // --- YENİ: DOM Element Selection for Features ---
    const productDetailModalOverlay = document.getElementById('product-detail-modal-overlay');
    const productDetailModal = document.getElementById('product-detail-modal');
    const closeProductDetailModalButton = document.getElementById('close-product-detail-modal');
    const addToCartFromDetailButton = document.getElementById('add-to-cart-from-detail');
    const productQuestionForm = document.getElementById('product-question-form');
    const generalContactForm = document.getElementById('general-contact-form');

    // --- State Management ---
    let products = [];
    let cart = [];
    let filteredProducts = []; // YENİ: Filtrelenmiş ürünleri tutacak dizi

    // --- API Fetching and Processing ---
    const fetchProducts = async () => {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            let fetchedProducts = await response.json();
            products = fetchedProducts.map(p => ({
                ...p,
                originalPrice: p.price * 1.25,
                discountPercent: Math.floor(Math.random() * 30) + 10,
                description: `Bu ürün, en kaliteli malzemelerle dikkatlice tasarlanmıştır. ${p.title}, hem şıklığı hem de işlevselliği bir arada sunar. Özel koleksiyonumuzun bu parçası, günlük hayatınıza konfor ve tarz katacaktır.`
            }));
            filteredProducts = [...products]; // Başlangıçta tüm ürünler filtrelidir
            renderProducts(filteredProducts);
        } catch (error) {
            console.error('Ürünler yüklenirken bir hata oluştu:', error);
            productListEl.innerHTML = '<p class="error-message">Ürünler yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>';
        }
    };

    // --- YENİ: Search Logic ---
    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        if (searchTerm === "") {
            filteredProducts = [...products]; // Arama kutusu boşsa, tüm ürünleri göster
        } else {
            filteredProducts = products.filter(product =>
                product.title.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) // Açıklamada da ara
            );
        }
        renderProducts(filteredProducts);
    };
    
    // --- Sorting Logic (Güncellendi) ---
    const sortProducts = (productsToSort, sortBy) => {
        const sortedProducts = [...productsToSort];
        switch (sortBy) {
            case 'price-asc': return sortedProducts.sort((a, b) => a.price - b.price);
            case 'price-desc': return sortedProducts.sort((a, b) => b.price - a.price);
            case 'name-asc': return sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
            default: return sortedProducts;
        }
    };

    // --- Rendering Functions ---
    const renderProducts = (productsToRender) => {
        productListEl.innerHTML = '';
        if (productsToRender.length === 0) {
            productListEl.innerHTML = '<p class="no-results-message">Aradığınız kriterde ürün bulunamadı.</p>';
            return;
        }
        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.title}" class="product-image">
                    <span class="discount-badge">%${product.discountPercent} İNDİRİM</span>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price-container">
                        <span class="product-original-price">₺${product.originalPrice.toFixed(2)}</span>
                        <p class="product-price">₺${product.price.toFixed(2)}</p>
                    </div>
                    <button class="view-details-btn" data-id="${product.id}">Detayları Gör</button>
                    <button class="add-to-cart-btn" data-id="${product.id}">
                        <i class="fas fa-shopping-bag"></i> Sepete Ekle
                    </button>
                </div>
            `;
            productListEl.appendChild(productCard);
        });
        document.querySelectorAll('.add-to-cart-btn').forEach(button => button.addEventListener('click', addToCart));
        document.querySelectorAll('.view-details-btn').forEach(button => button.addEventListener('click', openProductDetailModal));
    };

    const renderCart = () => {
        cartItemsEl.innerHTML = '';
        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="empty-cart-message">Sepetiniz henüz boş.</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <p class="cart-item-price">₺${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                            <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                            <button class="remove-item-btn" data-id="${item.id}" title="Ürünü Kaldır" aria-label="Ürünü Kaldır"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                `;
                cartItemsEl.appendChild(cartItem);
            });
            document.querySelectorAll('.decrease-quantity').forEach(button => button.addEventListener('click', decreaseQuantity));
            document.querySelectorAll('.increase-quantity').forEach(button => button.addEventListener('click', increaseQuantity));
            document.querySelectorAll('.quantity-input').forEach(input => input.addEventListener('change', updateQuantityFromInput));
            document.querySelectorAll('.remove-item-btn').forEach(button => button.addEventListener('click', removeFromCart));
        }
        updateCartSummary();
    };

    const updateCartSummary = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartCountEl.textContent = totalItems;
        cartSubtotalPriceEl.textContent = `₺${subtotalPrice.toFixed(2)}`;
        cartTotalPriceEl.textContent = `₺${subtotalPrice.toFixed(2)}`;
    };

    // --- Cart Logic ---
    const addToCart = (event) => {
        const productId = parseInt(event.currentTarget.dataset.id);
        const product = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) { 
            existingItem.quantity += 1; 
        } else { 
            cart.push({ ...product, quantity: 1 }); 
        }
        renderCart();
        event.currentTarget.innerHTML = '<i class="fas fa-check"></i> Eklendi!';
        setTimeout(() => { 
            event.currentTarget.innerHTML = '<i class="fas fa-shopping-bag"></i> Sepete Ekle'; 
        }, 1000);
    };

    const removeFromCart = (event) => { 
        cart = cart.filter(item => item.id !== parseInt(event.currentTarget.closest('button').dataset.id)); 
        renderCart(); 
    };

    const increaseQuantity = (event) => { 
        const item = cart.find(item => item.id === parseInt(event.currentTarget.dataset.id)); 
        if (item) { 
            item.quantity += 1; 
            renderCart(); 
        } 
    };

    const decreaseQuantity = (event) => { 
        const item = cart.find(item => item.id === parseInt(event.currentTarget.dataset.id)); 
        if (item && item.quantity > 1) { 
            item.quantity -= 1; 
            renderCart(); 
        } 
    };

    const updateQuantityFromInput = (event) => { 
        const productId = parseInt(event.currentTarget.dataset.id); 
        const newQuantity = parseInt(event.currentTarget.value); 
        if (newQuantity < 1) { 
            removeFromCart({ currentTarget: { closest: () => ({ dataset: { id: productId } }) } }); 
            return; 
        } 
        const item = cart.find(item => item.id === productId); 
        if (item) { 
            item.quantity = newQuantity; 
            updateCartSummary(); 
        } 
    };

    // --- Product Detail Modal Logic ---
    const openProductDetailModal = (event) => {
        const productId = parseInt(event.currentTarget.dataset.id);
        const product = products.find(p => p.id === productId);
        if (!product) return;
        document.getElementById('product-detail-title').textContent = product.title;
        document.getElementById('product-detail-image').src = product.image;
        document.getElementById('product-detail-image').alt = product.title;
        document.getElementById('product-detail-description').textContent = product.description;
        document.getElementById('product-detail-price').textContent = `₺${product.price.toFixed(2)}`;
        addToCartFromDetailButton.dataset.id = product.id;
        productDetailModalOverlay.classList.add('active');
    };
    
    // --- Form Submission Handlers ---
    const handleProductQuestionSubmit = (event) => {
        event.preventDefault();
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Gönderiliyor...'; 
        submitButton.disabled = true;
        setTimeout(() => { 
            alert('Sorunuz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.'); 
            event.target.reset(); 
            submitButton.textContent = originalText; 
            submitButton.disabled = false; 
        }, 1500);
    };

    const handleGeneralContactSubmit = (event) => {
        event.preventDefault();
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Gönderiliyor...'; 
        submitButton.disabled = true;
        setTimeout(() => { 
            alert('Mesajınız aldık! En kısa sürede size dönüş yapacağız.'); 
            event.target.reset(); 
            submitButton.textContent = originalText; 
            submitButton.disabled = false; 
        }, 1500);
    };

    // --- Event Listeners ---
    // YENİ: Arama event listener'ı
    searchInput.addEventListener('input', handleSearch);
    
    // Güncellenen Sıralama Listener'ı
    sortSelect.addEventListener('change', (event) => {
        const sortBy = event.target.value;
        const sortedProducts = sortProducts(filteredProducts, sortBy); // Filtrelenmiş ürünleri sırala
        renderProducts(sortedProducts);
    });

    cartButton.addEventListener('click', () => cartOverlay.classList.add('active'));
    closeCartButton.addEventListener('click', () => cartOverlay.classList.remove('active'));
    cartOverlay.addEventListener('click', (event) => { if (event.target === cartOverlay) cartOverlay.classList.remove('active'); });
    checkoutButton.addEventListener('click', () => { 
        if (cart.length === 0) { 
            alert('Sepetiniz boş. Ödeme yapamazsınız.'); 
            return; 
        } 
        cartOverlay.classList.remove('active'); 
        paymentModalOverlay.classList.add('active'); 
    });
    
    closePaymentModalButton.addEventListener('click', () => paymentModalOverlay.classList.remove('active'));
    cancelPaymentButton.addEventListener('click', () => paymentModalOverlay.classList.remove('active'));
    paymentModalOverlay.addEventListener('click', (event) => { if (event.target === paymentModalOverlay) paymentModalOverlay.classList.remove('active'); });
    confirmPaymentButton.addEventListener('click', () => {
        const cardName = document.getElementById('card-name').value; 
        const cardNumber = document.getElementById('card-number').value; 
        const expiryDate = document.getElementById('expiry-date').value; 
        const cvv = document.getElementById('cvv').value;
        if (!cardName || !cardNumber || !expiryDate || !cvv) { 
            alert('Lütfen ödeme formundaki tüm alanları doldurun.'); 
            return; 
        }
        confirmPaymentButton.textContent = 'İşleniyor...'; 
        confirmPaymentButton.disabled = true;
        setTimeout(() => { 
            alert(`Ödeme başarılı! Toplam ₺${cartTotalPriceEl.textContent} tutarındaki siparişiniz alınmıştır.`); 
            cart = []; 
            renderCart(); 
            paymentModalOverlay.classList.remove('active'); 
            confirmPaymentButton.textContent = 'Öde'; 
            confirmPaymentButton.disabled = false; 
        }, 2000);
    });

    // --- Event Listeners for Features ---
    closeProductDetailModalButton.addEventListener('click', () => productDetailModalOverlay.classList.remove('active'));
    productDetailModalOverlay.addEventListener('click', (event) => { if (event.target === productDetailModalOverlay) productDetailModalOverlay.classList.remove('active'); });
    addToCartFromDetailButton.addEventListener('click', (event) => { 
        addToCart({ currentTarget: event.target }); 
        productDetailModalOverlay.classList.remove('active'); 
    });
    productQuestionForm.addEventListener('submit', handleProductQuestionSubmit);
    generalContactForm.addEventListener('submit', handleGeneralContactSubmit);

    // --- Initial Load ---
    fetchProducts();
    renderCart();
});