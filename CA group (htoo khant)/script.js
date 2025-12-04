let selectedItem = {};
let cartItems = [];
let cartCount = 0;
let currentQuantity = 1;

/**
 * Define product options for all bundles.
 * NOTE: The structure assumes standard item prices are known, even if discounted in the bundle.
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

/**
 * Load cart from localStorage
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
 * Save cart to localStorage
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

/**
 * Utility function to format price to European currency string (e.g., "5.10").
 * @param {number} price - The price value.
 * @returns {string} Formatted price string.
 */
function formatPrice(price) {
    return price.toFixed(2);
}

/**
 * Updates the quantity display and the dynamic price button text.
 */
function updateModalUI() {
    document.getElementById('modal-qty-display').innerText = currentQuantity;
    document.getElementById('modal-qty').value = currentQuantity;

    const totalPrice = (selectedItem.price * currentQuantity);
    document.getElementById('modal-price-btn').innerText = formatPrice(totalPrice);
}

/**
 * Populates the three choice dropdowns based on the bundle ID.
 * @param {number} id - The item ID (905, 906, or 907).
 */
function populateBundleSelectors(id) {
    const selectorContainer = document.getElementById('smoothie-selectors');
    // Clear previous contents
    selectorContainer.innerHTML = '';

    let choices;
    if (id === 905) {
        choices = SMOOTHIE_CHOICES;
    } else if (id === 906) {
        choices = FRESH_JUICE_CHOICES;
    } else if (id === 907) {
        choices = DETOX_ENERGY_CHOICES;
    } else {
        return; // Not a bundle, do nothing
    }

    const defaultOption = '<option value="">--- Select Choice ---</option>';
    let optionsHtml = choices.map(choice => `<option value="${choice.value}">${choice.label}</option>`).join('');

    // Create and append the three required selectors
    for (let i = 1; i <= 3; i++) {
        const selectElement = document.createElement('select');
        selectElement.id = `bundle-choice-${i}`;
        selectElement.className = 'choice-select';
        selectElement.innerHTML = defaultOption + optionsHtml;
        selectorContainer.appendChild(selectElement);
    }
}

// --- PRODUCT MODAL LOGIC ---

/**
 * Opens the product detail modal, populating it with the clicked item's data.
 * @param {number} id - Item ID
 * @param {string} name - Item Name
 * @param {string} desc - Item Description
 * @param {number} price - Item Price
 * @param {string} img - Image URL
 */
function openDetails(id, name, desc, price, img, isSweet) { 
    // Check if the item is any fixed bundle deal (905, 906, or 907)
    const isBundleDeal = (id >= 905 && id <= 907);

    // 1. Set global state for the item being configured
    selectedItem = { id, name, desc, price, img, isBundleDeal };
    currentQuantity = 1;

    // 2. Populate modal content
    document.getElementById('modal-title').innerText = name;
    document.getElementById('modal-desc').innerText = desc;
    document.getElementById('modal-img').src = img;

    // 3. Reset form fields
    document.getElementById('modal-request').value = "";
    
    // 4. Handle visibility of Bundle Selectors
    const bundleOptionsDiv = document.getElementById('bundle-options');
    if (isBundleDeal) {
        bundleOptionsDiv.style.display = 'block';
        populateBundleSelectors(id);
    } else {
        bundleOptionsDiv.style.display = 'none';
    }

    // 5. Update the quantity display and price button
    updateModalUI(); 

    // 6. Hide/Show Quantity buttons based on if it's a bundle
    const qtySelector = document.querySelector('.qty-selector-group');
    
    if (qtySelector) {
        if (selectedItem.isBundleDeal) {
            currentQuantity = 1; 
            updateModalUI();
            qtySelector.classList.add('fixed-qty');
        } else {
            qtySelector.classList.remove('fixed-qty');
        }
    }

    // 7. Show Modal
    document.getElementById('detailsModal').style.display = "flex";
}

function closeDetails() {
    document.getElementById('detailsModal').style.display = "none";
}

function changeQty(change) {
    if (selectedItem.isBundleDeal) {
        return;
    }

    const newQty = currentQuantity + change;
    if (newQty >= 1) {
        currentQuantity = newQty;
        updateModalUI();
    }
}

// --- CART LOGIC ---

function addToCart() {
    const qtyToAdd = currentQuantity; 
    let specialRequest = document.getElementById('modal-request').value.trim();
    let choicesValid = true;
    
    // NEW: Capture Choices for ALL Bundles (ID 905, 906, 907)
    if (selectedItem.isBundleDeal) {
        const choice1 = document.getElementById('bundle-choice-1').value;
        const choice2 = document.getElementById('bundle-choice-2').value;
        const choice3 = document.getElementById('bundle-choice-3').value;
        
        // Validation: Ensure 3 choices are selected
        if (!choice1 || !choice2 || !choice3) {
            alert(`Please select all 3 choices for your ${selectedItem.name}.`);
            choicesValid = false;
        }
        
        if (choicesValid) {
            const bundleChoices = [choice1, choice2, choice3].join(', ');
            
            // Prepend the bundle choices to the special request field
            const choiceType = selectedItem.name.includes('Smoothie') ? 'Smoothie Choices' : selectedItem.name.includes('Juice') ? 'Juice Choices' : 'Drink Choices';
            
            if (specialRequest) {
                 specialRequest = `${choiceType}: ${bundleChoices}. Note: ${specialRequest}`;
            } else {
                 specialRequest = `${choiceType}: ${bundleChoices}`;
            }
        }
    }
    
    if (!choicesValid && selectedItem.isBundleDeal) {
        return; // Stop execution if bundle choices are incomplete
    }

    // Existing logic to add to cart:
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
 * Recalculates the total item count and updates the navbar badge.
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
 * Renders the contents of the cartItems array into the Cart Sidebar HTML.
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

            // Display the Special Request in the Cart Sidebar
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

    // Update the total summary in the footer
    document.querySelector('.sidebar-header h2').innerText = `Cart (${itemCount} Item${itemCount === 1 ? '' : 's'})`;
    document.querySelector('.total-summary .total-price').innerText = `€${formatPrice(subtotal)}`;
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.innerText = itemCount;
    }
}

/**
 * Toggles the visibility of the cart sidebar and refreshes the content.
 */
function viewCart() {
    const sidebar = document.getElementById('cartSidebar');
    sidebar.classList.add('open');
    renderCartItems();
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
}

/**
 * Updates the quantity of an item directly in the cart.
 * @param {number} index - Index of the item in the cartItems array.
 * @param {number} change - +1 or -1.
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
 * Removes an item from the cartItems array.
 * @param {number} index - Index of the item in the cartItems array.
 */
function removeFromCart(index) {
    cartItems.splice(index, 1);
    saveCart();
    renderCartItems();
    updateCartCountAndUI();
}

/**
 * Handles the checkout process.
 */
function startCheckout() {
    if (cartItems.length === 0) {
        alert("Your cart is empty. Please add items before checking out!");
        return;
    }

    closeCart(); 
    
    const customerIsLoggedIn = false; 

    if (customerIsLoggedIn) {
        alert("Welcome back! Proceeding to Payment & Shipping.");
    } else {
        const needsToLogIn = confirm(
            "You need to be logged in to continue.\n\n" + 
            "Press OK to Log In to an existing account.\n" + 
            "Press Cancel to Register a new account."
        );
        
        if (needsToLogIn) {
            alert("Redirecting to the Login page...");
        } else {
            alert("Redirecting to the Registration page...");
        }
    }
}

// Load cart when page loads
window.addEventListener('DOMContentLoaded', function() {
    loadCart();
});

// Making functions globally accessible is necessary for inline onclicks in HTML
window.openDetails = openDetails;
window.closeDetails = closeDetails;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.viewCart = viewCart;
window.closeCart = closeCart;
window.updateCartItemQty = updateCartItemQty;
window.removeFromCart = removeFromCart;
window.startCheckout = startCheckout;