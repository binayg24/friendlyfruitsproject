/*
|--------------------------------------------------------------------------
| MAIN SHOPPING CART AND CHECKOUT SCRIPT
|--------------------------------------------------------------------------
| Handles product selection, cart management, and checkout process
| Integrates with registration page for user authentication
*/

// Global variables for cart state
let selectedItem = {};
let cartItems = [];
let cartCount = 0;
let currentQuantity = 1;

/*
|--------------------------------------------------------------------------
| PRODUCT BUNDLE CHOICES DEFINITIONS
|--------------------------------------------------------------------------
| Defines available options for each bundle deal
*/

const SMOOTHIE_CHOICES = [
    { value: 'Energy Boost', label: 'Energy Boost Smoothie (€5.10)' },
    { value: 'Green Detox', label: 'Green Detox Smoothie (€5.50)' },
    { value: 'Mango Delight', label: 'Mango Delight Smoothie (€5.35)' },
    { value: 'Diabetic-Friendly', label: 'Diabetic-Friendly Smoothie (€5.00)' }
];

const FRESH_JUICE_CHOICES = [
    { value: 'Orange Pure', label: 'Orange Pure (€4.50)' },
    { value: 'Apple Glow', label: 'Apple Glow (€4.30)' },
    { value: 'Watermelon Fresh', label: 'Watermelon Fresh (€4.70)' },
    { value: 'Carrot Delight', label: 'Carrot Delight (€4.60)' },
    { value: 'Tropical Blast', label: 'Tropical Blast (€5.00)' }
];

const DETOX_ENERGY_CHOICES = [
    { value: 'Ginger Lemon Detox', label: 'Ginger Lemon Detox (€4.50)' },
    { value: 'Turmeric Shot', label: 'Turmeric Shot (€4.80)' },
    { value: 'Wheatgrass Pure', label: 'Wheatgrass Pure (€5.20)' },
    { value: 'Beetroot Revive', label: 'Beetroot Revive (€4.90)' }
];

/*
|--------------------------------------------------------------------------
| CART PERSISTENCE - LOCALSTORAGE
|--------------------------------------------------------------------------
*/

/**
 * Loads cart data from localStorage on page load
 * Ensures cart persists across page refreshes
 */
function loadCart() {
    try {
        const data = localStorage.getItem('greeny-cart-items');
        if (data) {
            const parsed = JSON.parse(data);
            cartItems = parsed.items || [];
            cartCount = parsed.count || 0;
        }
    } catch (error) {
        console.log('No existing cart found');
        cartItems = [];
        cartCount = 0;
    }
    updateCartCountAndUI();
}

/**
 * Saves current cart state to localStorage
 * Called whenever cart is modified
 */
function saveCart() {
    try {
        const data = {
            items: cartItems,
            count: cartCount
        };
        localStorage.setItem('greeny-cart-items', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

/*
|--------------------------------------------------------------------------
| HELPER FUNCTIONS
|--------------------------------------------------------------------------
*/

/**
 * Formats price to European currency string
 * @param {number} price - The price value
 * @returns {string} Formatted price (e.g., "5.10")
 */
function formatPrice(price) {
    return price.toFixed(2);
}

/**
 * Updates the modal UI with current quantity and price
 */
function updateModalUI() {
    const qtyDisplay = document.getElementById('modal-qty-display');
    const qtyHidden = document.getElementById('modal-qty');

    if (qtyDisplay) qtyDisplay.innerText = currentQuantity;
    if (qtyHidden) qtyHidden.value = currentQuantity;

    const totalPrice = (selectedItem.price * currentQuantity);
    document.getElementById('modal-price-btn').innerText = formatPrice(totalPrice);
}

/**
 * Populates bundle selector dropdowns based on bundle ID
 * @param {number} id - The bundle item ID (905, 906, or 907)
 */
function populateBundleSelectors(id) {
    const selectorContainer = document.getElementById('smoothie-selectors');
    selectorContainer.innerHTML = '';

    let choices;
    if (id === 905) {
        choices = SMOOTHIE_CHOICES;
    } else if (id === 906) {
        choices = FRESH_JUICE_CHOICES;
    } else if (id === 907) {
        choices = DETOX_ENERGY_CHOICES;
    } else {
        return;
    }

    const defaultOption = '<option value="">--- Select Choice ---</option>';
    let optionsHtml = choices.map(choice => `<option value="${choice.value}">${choice.label}</option>`).join('');

    // Create three dropdown selectors for the bundle
    for (let i = 1; i <= 3; i++) {
        const selectElement = document.createElement('select');
        selectElement.id = `bundle-choice-${i}`;
        selectElement.className = 'choice-select form-control';
        selectElement.innerHTML = defaultOption + optionsHtml;
        selectorContainer.appendChild(selectElement);
    }
}

/*
|--------------------------------------------------------------------------
| PRODUCT MODAL FUNCTIONS
|--------------------------------------------------------------------------
*/

/**
 * Opens product detail modal with item information
 * @param {number} id - Item ID
 * @param {string} name - Item Name
 * @param {string} desc - Item Description
 * @param {number} price - Item Price
 * @param {string} img - Image URL
 */
function openDetails(id, name, desc, price, img, isSweet) { 
    const isBundleDeal = (id >= 905 && id <= 907);

    // Set global state
    selectedItem = { id, name, desc, price, img, isBundleDeal };
    currentQuantity = 1;

    // Populate modal
    document.getElementById('modal-title').innerText = name;
    document.getElementById('modal-desc').innerText = desc;
    document.getElementById('modal-img').src = img;
    document.getElementById('modal-request').value = "";
    
    // Handle bundle selectors
    const bundleOptionsDiv = document.getElementById('bundle-options');
    if (isBundleDeal) {
        bundleOptionsDiv.style.display = 'block';
        populateBundleSelectors(id);
    } else {
        bundleOptionsDiv.style.display = 'none';
    }

    updateModalUI(); 

    // Show quantity selector
    const qtySelector = document.querySelector('.qty-selector-group');
    if (qtySelector) {
        if (selectedItem.isBundleDeal) {
            currentQuantity = 1; 
            updateModalUI();
            qtySelector.classList.remove('fixed-qty');
        } else {
            qtySelector.classList.remove('fixed-qty');
        }
    }

    document.getElementById('detailsModal').style.display = "flex";
}

/**
 * Closes the product detail modal
 */
function closeDetails() {
    document.getElementById('detailsModal').style.display = "none";
}

/**
 * Changes quantity in the modal
 * @param {number} change - Amount to change (+1 or -1)
 */
function changeQty(change) {
    const newQty = currentQuantity + change;
    if (newQty >= 1) {
        currentQuantity = newQty;
        updateModalUI();
    }
}

/*
|--------------------------------------------------------------------------
| CART MANAGEMENT FUNCTIONS
|--------------------------------------------------------------------------
*/

/**
 * Adds selected item to shopping cart
 * Validates bundle selections and handles special requests
 */
function addToCart() {
    const qtyToAdd = currentQuantity; 
    let specialRequest = document.getElementById('modal-request').value.trim();
    let choicesValid = true;
    
    // Handle bundle deal selections
    if (selectedItem.isBundleDeal) {
        const choice1 = document.getElementById('bundle-choice-1').value;
        const choice2 = document.getElementById('bundle-choice-2').value;
        const choice3 = document.getElementById('bundle-choice-3').value;
        
        // Validate all three choices are selected
        if (!choice1 || !choice2 || !choice3) {
            alert(`Please select all 3 choices for your ${selectedItem.name}.`);
            choicesValid = false;
        }
        
        if (choicesValid) {
            const bundleChoices = [choice1, choice2, choice3].join(', ');
            const choiceType = selectedItem.name.includes('Smoothie') ? 'Smoothie Choices' : 
                              selectedItem.name.includes('Juice') ? 'Juice Choices' : 'Drink Choices';
            
            if (specialRequest) {
                 specialRequest = `${choiceType}: ${bundleChoices}. Note: ${specialRequest}`;
            } else {
                 specialRequest = `${choiceType}: ${bundleChoices}`;
            }
        }
    }
    
    if (!choicesValid && selectedItem.isBundleDeal) {
        return;
    }

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.itemId === selectedItem.id);
    let forceNewItem = selectedItem.isBundleDeal; 

    if (existingItemIndex > -1 && !forceNewItem) {
        let existingItem = cartItems[existingItemIndex];
        
        if (!specialRequest || existingItem.request === specialRequest) {
            existingItem.qty += qtyToAdd; 
            existingItem.totalPrice = existingItem.price * existingItem.qty; 
            cartItems[existingItemIndex] = existingItem;
        } else {
            const newItem = {
                itemId: selectedItem.id, 
                name: selectedItem.name,
                price: selectedItem.price,
                qty: qtyToAdd,
                img: selectedItem.img,
                request: specialRequest,
                totalPrice: selectedItem.price * qtyToAdd,
                isBundleDeal: selectedItem.isBundleDeal 
            };
            cartItems.push(newItem);
        }
        
    } else {
        const newItem = {
            itemId: selectedItem.id,
            name: selectedItem.name,
            price: selectedItem.price,
            qty: qtyToAdd,
            img: selectedItem.img,
            request: specialRequest,
            totalPrice: selectedItem.price * qtyToAdd,
            isBundleDeal: selectedItem.isBundleDeal
        };
        cartItems.push(newItem);
    }

    saveCart();
    updateCartCountAndUI();
    closeDetails();
}

/**
 * Updates total item count and navbar badge
 */
function updateCartCountAndUI() {
    let newCartCount = 0;
    cartItems.forEach(item => {
        newCartCount += item.qty; 
    });
    cartCount = newCartCount;
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.innerText = cartCount;
    }
    saveCart();
}

/**
 * Renders cart items in the sidebar
 */
function renderCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    let subtotal = 0;
    let itemCount = 0;
    
    cartItemsContainer.innerHTML = '';

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 40px 20px; color: #777;">Your cart is empty!</p>';
    } else {
        cartItems.forEach((item, index) => {
            subtotal += item.totalPrice;
            itemCount += item.qty;

            const requestText = item.request ? `<p class="item-request" style="font-style: italic; color: #333; font-size: 0.85rem; margin: 3px 0 5px;">${item.request.substring(0, 70)}${item.request.length > 70 ? '...' : ''}</p>` : '';
            
            const itemHtml = `
                <div class="cart-item" data-index="${index}">
                    <div class="item-image-wrapper">
                        <img src="${item.img}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <p class="item-name">${item.name}</p>
                        ${requestText}
                        <div class="item-qty-controls">
                            <div class="qty-selector-group small">
                                <button onclick="updateCartItemQty(${index}, -1)">−</button>
                                <span class="item-qty-display">${item.qty}</span>
                                <button onclick="updateCartItemQty(${index}, 1)">+</button>
                            </div>
                        </div>
                    </div>
                    <div class="item-total-and-remove">
                        <span class="item-total">€${formatPrice(item.totalPrice)}</span>
                        <button class="remove-item" onclick="removeFromCart(${index})">
                            <i class="trash-icon">🗑️</i>
                        </button>
                    </div>
                </div>
            `;
            cartItemsContainer.innerHTML += itemHtml;
        });
    }

    // Update footer totals
    document.querySelector('.sidebar-header h2').innerText = `Cart (${itemCount} Item${itemCount === 1 ? '' : 's'})`;
    document.querySelector('.total-summary .total-price').innerText = `€${formatPrice(subtotal)}`;
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.innerText = itemCount;
    }
}

/**
 * Opens cart sidebar
 */
function viewCart() {
    const sidebar = document.getElementById('cartSidebar');
    sidebar.classList.add('open'); 
    renderCartItems();
}

/**
 * Closes cart sidebar
 */
function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
}

/**
 * Updates quantity of item in cart
 * @param {number} index - Item index in cartItems array
 * @param {number} change - Amount to change (+1 or -1)
 */
function updateCartItemQty(index, change) {
    const item = cartItems[index];
    const newQty = item.qty + change;
    
    if (newQty >= 1) {
        item.qty = newQty;
        item.totalPrice = item.price * newQty;
        saveCart();
        renderCartItems();
    } else if (newQty === 0) {
        removeFromCart(index);
    }
}

/**
 * Removes item from cart
 * @param {number} index - Item index in cartItems array
 */
function removeFromCart(index) {
    cartItems.splice(index, 1);
    saveCart();
    renderCartItems();
    updateCartCountAndUI();
}

/*
|--------------------------------------------------------------------------
| CHECKOUT PROCESS - REGISTRATION INTEGRATION
|--------------------------------------------------------------------------
| This function integrates with the registration page
| Checks if user is registered before allowing checkout
*/

/**
 * Handles checkout process
 * Checks for user registration and redirects accordingly
 */
function startCheckout() {
    // Validate cart is not empty
    if (cartItems.length === 0) {
        alert("Your cart is empty. Please add items before checking out!");
        return;
    }

    closeCart(); 
    
    // Check if user is registered (checks localStorage for user data)
    const userData = localStorage.getItem('greenyStoreUser');
    const customerIsLoggedIn = userData !== null;

    if (customerIsLoggedIn) {
        // User is registered - proceed to payment
        alert("Welcome back! Proceeding to Payment & Shipping.\n\nIn a full implementation, this would redirect to a payment gateway.");
        // In real implementation: window.location.href = 'checkout.html';
    } else {
        // User needs to register or login
        const needsToRegister = confirm(
            "To complete your order, please create an account or log in.\n\n" + 
            "Press OK to Register a new account.\n" + 
            "Press Cancel if you already have an account to Log In."
        );
        
        if (needsToRegister) {
            // Redirect to registration page
            window.location.href = 'registration.html';
        } else {
            // Login not implemented yet, redirect to registration
            alert("Login functionality will be implemented in a future phase.\n\nFor now, please register a new account.");
            window.location.href = 'registration.html';
        }
    }
}

/*
|--------------------------------------------------------------------------
| PAGE INITIALIZATION
|--------------------------------------------------------------------------
*/

// Load cart when page loads
window.addEventListener('DOMContentLoaded', function() {
    loadCart();
});

/*
|--------------------------------------------------------------------------
| GLOBAL FUNCTION EXPORTS
|--------------------------------------------------------------------------
| Make functions globally accessible for inline onclick handlers
*/

window.openDetails = openDetails;
window.closeDetails = closeDetails;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.viewCart = viewCart;
window.closeCart = closeCart;
window.updateCartItemQty = updateCartItemQty;
window.removeFromCart = removeFromCart;
window.startCheckout = startCheckout;