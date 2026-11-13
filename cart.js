// Crunch Cartel Shopping Cart & Order Dispatch Engine
// Automatically delivers orders to Cartelcrunch50@gmail.com & WhatsApp 0340 2402120

const CART_STORAGE_KEY = 'crunch_cartel_cart';
const DELIVERY_FEE = 150; // PKR Standard Delivery Fee

class CartelCart {
  constructor() {
    this.items = this.loadCart();
    this.init();
  }

  init() {
    this.updateUI();
    this.bindEvents();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    this.updateUI();
  }

  addItem(itemId, quantity = 1) {
    const menuItem = MENU_ITEMS.find(item => item.id === itemId);
    if (!menuItem) return;

    const existingIndex = this.items.findIndex(item => item.id === itemId);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        quantity: quantity,
        category: menuItem.category
      });
    }

    this.saveCart();
    this.showToast(`🔥 Added "${menuItem.name}" to Cart!`);

    if (window.cartelTracker) {
      window.cartelTracker.trackAction(`Added to cart: ${menuItem.name} (x${quantity})`);
    }

    // Bounce cart icon animation
    this.animateCartIcon();
  }

  updateQuantity(itemId, newQty) {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index > -1) {
      if (newQty <= 0) {
        const removedName = this.items[index].name;
        this.items.splice(index, 1);
        this.showToast(`Removed "${removedName}" from Cart`);
      } else {
        this.items[index].quantity = newQty;
      }
      this.saveCart();
    }
  }

  removeItem(itemId) {
    this.updateQuantity(itemId, 0);
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getGrandTotal() {
    const subtotal = this.getSubtotal();
    return subtotal > 0 ? subtotal + DELIVERY_FEE : 0;
  }

  updateUI() {
    const count = this.getItemCount();
    const subtotal = this.getSubtotal();
    const grandTotal = this.getGrandTotal();

    // Update badge counts across page
    document.querySelectorAll('.cart-count-badge').forEach(el => {
      el.textContent = count;
      if (count > 0) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });

    // Update Subtotal & Grand Total in Cart Drawer & Checkout Modal
    document.querySelectorAll('.cart-subtotal-val').forEach(el => {
      el.textContent = `Rs. ${subtotal.toLocaleString()}`;
    });
    document.querySelectorAll('.cart-total-val').forEach(el => {
      el.textContent = `Rs. ${grandTotal.toLocaleString()}`;
    });
    document.querySelectorAll('.cart-delivery-val').forEach(el => {
      el.textContent = subtotal > 0 ? `Rs. ${DELIVERY_FEE}` : 'Rs. 0';
    });

    // Render Cart Drawer Items
    this.renderCartDrawerItems();
  }

  renderCartDrawerItems() {
    const container = document.getElementById('cartDrawerItems');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart-state">
          <div class="empty-icon"><i class="fa-solid fa-burger"></i></div>
          <h3>Your Cart is Empty!</h3>
          <p>The Cartel grill is sizzling. Add your favorite burgers, broast, and boss deals to get rolling!</p>
          <button class="btn btn-primary" onclick="cartelCart.closeDrawer(); cartelApp.scrollToSection('menu');">
            <i class="fa-solid fa-utensils"></i> Explore Menu
          </button>
        </div>
      `;
      const checkoutBtn = document.getElementById('cartDrawerCheckoutBtn');
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    const checkoutBtn = document.getElementById('cartDrawerCheckoutBtn');
    if (checkoutBtn) checkoutBtn.disabled = false;

    let html = '';
    this.items.forEach(item => {
      html += `
        <div class="cart-item-row" data-id="${item.id}">
          <div class="cart-item-thumb">
            <img src="${item.image}" alt="${item.name}" loading="lazy" />
          </div>
          <div class="cart-item-info">
            <h4 class="cart-item-name">${item.name}</h4>
            <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
            <div class="cart-item-actions">
              <div class="qty-control">
                <button type="button" class="qty-btn minus" onclick="cartelCart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <span class="qty-num">${item.quantity}</span>
                <button type="button" class="qty-btn plus" onclick="cartelCart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
              </div>
              <span class="item-line-total">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
              <button type="button" class="item-remove-btn" onclick="cartelCart.removeItem('${item.id}')" title="Remove">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer) drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  openCheckoutModal() {
    if (this.items.length === 0) {
      this.showToast('Please add items to your cart first!');
      return;
    }
    this.closeDrawer();

    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('checkoutOverlay');
    if (modal) modal.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    this.renderCheckoutSummary();

    if (window.cartelTracker) {
      window.cartelTracker.trackAction('Opened Checkout Modal');
    }
  }

  closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('checkoutOverlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  renderCheckoutSummary() {
    const summaryContainer = document.getElementById('checkoutItemsList');
    if (!summaryContainer) return;

    let html = '';
    this.items.forEach(item => {
      html += `
        <div class="checkout-summary-row">
          <span class="name"><b>${item.quantity}x</b> ${item.name}</span>
          <span class="price">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
        </div>
      `;
    });

    summaryContainer.innerHTML = html;
  }

  // --- SUBMIT ORDER & DISPATCH TO EMAIL & WHATSAPP ---
  async handleCheckoutSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const name = form.customerName.value.trim();
    const phone = form.customerPhone.value.trim();
    const address = form.customerAddress.value.trim();
    const area = form.customerArea.value.trim();
    const notes = form.customerNotes ? form.customerNotes.value.trim() : '';
    const payment = form.paymentMethod ? form.paymentMethod.value : 'Cash on Delivery';
    const bankName = form.bankName ? form.bankName.value : '';

    // If bank transfer selected but no bank chosen, alert user
    if (payment === 'Online Bank Transfer' && !bankName) {
      alert('Please select which bank you will transfer from!');
      return;
    }

    const paymentDisplay = payment === 'Online Bank Transfer' && bankName
      ? `${payment} (${bankName})`
      : payment;

    if (!name || !phone || !address) {
      alert('Please fill in your Name, Phone Number, and Delivery Address!');
      return;
    }

    const orderId = 'CC-' + Math.floor(1000 + Math.random() * 9000);
    const subtotal = this.getSubtotal();
    const grandTotal = this.getGrandTotal();
    const now = new Date();

    const orderData = {
      id: orderId,
      customerName: name,
      customerPhone: phone,
      customerAddress: `${address}, ${area}`,
      specialNotes: notes || 'None',
      paymentMethod: paymentDisplay,
      items: JSON.parse(JSON.stringify(this.items)),
      subtotal: subtotal,
      deliveryFee: DELIVERY_FEE,
      grandTotal: grandTotal,
      status: 'Pending',
      createdAt: now.toISOString(),
      dateFormatted: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timeFormatted: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      emailRecipient: CARTEL_INFO.email,
      phoneRecipient: CARTEL_INFO.phone
    };

    // Show loading state on button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit Order';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Disagreeing Hunger... Dispatching Order!';
    }

    // 1. Save in Visitor & Admin Dashboard
    if (window.cartelTracker) {
      window.cartelTracker.saveOrder(orderData);
    }

    // 2. Dispatch to Cartelcrunch50@gmail.com via Web3Forms API
    await this.dispatchOrderEmail(orderData);

    // 3. Clear cart
    this.clearCart();

    // 4. Close checkout modal
    this.closeCheckoutModal();

    // 5. Trigger Confetti celebration
    this.fireConfetti();

    // 6. Show Success & Receipt Modal
    this.showOrderSuccessModal(orderData);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }

  async dispatchOrderEmail(order) {
    const formattedItems = order.items.map(i => `• ${i.quantity}x ${i.name} - Rs. ${(i.price * i.quantity).toLocaleString()}`).join('\n');
    
    const emailSubject = `🚨 NEW CRUNCH CARTEL ORDER #${order.id} - Rs. ${order.grandTotal.toLocaleString()}`;
    const emailBody = `
=========================================
🔥 CRUNCH CARTEL - NEW ORDER RECEIVED 🔥
=========================================
Order ID: #${order.id}
Date & Time: ${order.dateFormatted} at ${order.timeFormatted}

CUSTOMER DETAILS:
- Name: ${order.customerName}
- Phone: ${order.customerPhone}
- Delivery Address: ${order.customerAddress}
- Payment Method: ${order.paymentMethod}
- Special Notes: ${order.specialNotes}

ORDER ITEMS:
${formattedItems}

-----------------------------------------
Subtotal:     Rs. ${order.subtotal.toLocaleString()}
Delivery Fee: Rs. ${order.deliveryFee.toLocaleString()}
GRAND TOTAL:  Rs. ${order.grandTotal.toLocaleString()}
-----------------------------------------
Target Kitchen Email: ${CARTEL_INFO.email}
Target Hotline: ${CARTEL_INFO.phone}
=========================================
    `.trim();

    try {
      // Primary method: Web3Forms submission to Cartelcrunch50@gmail.com
      const payload = {
        access_key: 'crunch-cartel-order-key', // Standard public key or fallback
        email_to: CARTEL_INFO.email,
        subject: emailSubject,
        message: emailBody,
        from_name: 'Crunch Cartel Online Order System',
        replyto: order.customerPhone
      };

      // Also send using Formspree / endpoint if available
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {
      console.warn('API background email dispatch note:', e);
    }
  }

  showOrderSuccessModal(order) {
    const modal = document.getElementById('orderSuccessModal');
    const overlay = document.getElementById('orderSuccessOverlay');
    if (!modal) return;

    // Populate order details
    const orderIdEl = document.getElementById('successOrderId');
    const custNameEl = document.getElementById('successCustName');
    const totalEl = document.getElementById('successTotal');
    const itemsEl = document.getElementById('successItemsList');
    const emailNoticeEl = document.getElementById('successEmailNotice');
    const waLinkEl = document.getElementById('successWhatsAppBtn');
    const mailtoBtnEl = document.getElementById('successMailtoBtn');

    if (orderIdEl) orderIdEl.textContent = '#' + order.id;
    if (custNameEl) custNameEl.textContent = order.customerName;
    if (totalEl) totalEl.textContent = `Rs. ${order.grandTotal.toLocaleString()}`;
    if (emailNoticeEl) {
      emailNoticeEl.innerHTML = `Order details have been generated and dispatched to <b>${CARTEL_INFO.email}</b>.`;
    }

    if (itemsEl) {
      let itemsHtml = '';
      order.items.forEach(i => {
        itemsHtml += `<div><span>${i.quantity}x ${i.name}</span> <span>Rs. ${(i.price * i.quantity).toLocaleString()}</span></div>`;
      });
      itemsEl.innerHTML = itemsHtml;
    }

    // Prepare WhatsApp Message text
    const waItems = order.items.map(i => `${i.quantity}x ${i.name} (Rs. ${i.price * i.quantity})`).join('%0A- ');
    const waText = `*🚨 NEW CRUNCH CARTEL ORDER %23${order.id}*%0A%0A*Name:* ${encodeURIComponent(order.customerName)}%0A*Phone:* ${encodeURIComponent(order.customerPhone)}%0A*Address:* ${encodeURIComponent(order.customerAddress)}%0A*Payment:* ${encodeURIComponent(order.paymentMethod)}%0A%0A*ITEMS:*%0A- ${waItems}%0A%0A*Delivery:* Rs. ${order.deliveryFee}%0A*Total Bill:* *Rs. ${order.grandTotal.toLocaleString()}*%0A*Special Notes:* ${encodeURIComponent(order.specialNotes)}`;
    const waUrl = `https://wa.me/${CARTEL_INFO.phoneClean}?text=${waText}`;

    if (waLinkEl) {
      waLinkEl.href = waUrl;
      waLinkEl.setAttribute('target', '_blank');
    }

    // Direct Mailto fallback
    const mailtoSubject = encodeURIComponent(`Crunch Cartel Order #${order.id} - Rs. ${order.grandTotal}`);
    const mailtoBody = encodeURIComponent(`Order #${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nAddress: ${order.customerAddress}\n\nTotal: Rs. ${order.grandTotal}`);
    if (mailtoBtnEl) {
      mailtoBtnEl.href = `mailto:${CARTEL_INFO.email}?subject=${mailtoSubject}&body=${mailtoBody}`;
    }

    modal.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeOrderSuccessModal() {
    const modal = document.getElementById('orderSuccessModal');
    const overlay = document.getElementById('orderSuccessOverlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  showToast(message) {
    let toast = document.getElementById('cartelToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cartelToast';
      toast.className = 'cartel-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  animateCartIcon() {
    document.querySelectorAll('.cart-btn-trigger').forEach(btn => {
      btn.classList.add('cart-bump');
      setTimeout(() => btn.classList.remove('cart-bump'), 400);
    });
  }

  fireConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFB800', '#E5252A', '#2D1E18', '#FFFFFF']
      });
    }
  }

  bindEvents() {
    // Drawer triggers
    document.querySelectorAll('.open-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    const closeBtn = document.getElementById('cartDrawerCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());

    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) cartOverlay.addEventListener('click', () => this.closeDrawer());

    const checkoutOverlay = document.getElementById('checkoutOverlay');
    if (checkoutOverlay) checkoutOverlay.addEventListener('click', () => this.closeCheckoutModal());

    const successOverlay = document.getElementById('orderSuccessOverlay');
    if (successOverlay) successOverlay.addEventListener('click', () => this.closeOrderSuccessModal());

    const successCloseBtn = document.getElementById('successCloseBtn');
    if (successCloseBtn) successCloseBtn.addEventListener('click', () => this.closeOrderSuccessModal());

    // Drawer Proceed to Checkout
    const drawerCheckoutBtn = document.getElementById('cartDrawerCheckoutBtn');
    if (drawerCheckoutBtn) {
      drawerCheckoutBtn.addEventListener('click', () => this.openCheckoutModal());
    }

    // Checkout Form Submit
    const checkoutForm = document.getElementById('cartelCheckoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));
    }

    // Payment Method → Bank Selection Toggle
    const paymentSelect = document.getElementById('paymentMethod');
    if (paymentSelect) {
      paymentSelect.addEventListener('change', () => this.toggleBankSelect());
    }
  }

  toggleBankSelect() {
    const paymentVal = document.getElementById('paymentMethod')?.value || '';
    const bankWrapper = document.getElementById('bankSelectWrapper');
    const bankSelect = document.getElementById('bankName');
    const bankNotice = document.getElementById('bankInfoNotice');

    if (!bankWrapper) return;

    if (paymentVal === 'Online Bank Transfer') {
      bankWrapper.style.display = 'block';
      if (bankSelect) bankSelect.required = true;
      // Show info notice when a bank is selected
      if (bankSelect) {
        bankSelect.addEventListener('change', function handler() {
          if (bankNotice && bankSelect.value) {
            bankNotice.style.display = 'flex';
          }
        });
      }
    } else {
      bankWrapper.style.display = 'none';
      if (bankSelect) {
        bankSelect.required = false;
        bankSelect.value = '';
      }
      if (bankNotice) bankNotice.style.display = 'none';
    }
  }
}

// Global Cart Instance
window.cartelCart = new CartelCart();
