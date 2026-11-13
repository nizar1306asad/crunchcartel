// Crunch Cartel Admin & Customer Visitor Analytics Dashboard
// Reads and manages live visitor logs and orders from CartelTracker and localStorage

class CartelDashboard {
  constructor() {
    this.visitorFilter = 'all';
    this.orderFilter = 'all';
    this.searchVisitorText = '';
    this.searchOrderText = '';
    this.activeTab = 'visitors';
    this.autoRefreshInterval = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderKPIs();
    this.renderVisitorsTable();
    this.renderOrdersTable();
    this.renderAnalyticsCharts();
    this.startAutoRefresh();
  }

  getVisitors() {
    try {
      const data = localStorage.getItem('crunch_cartel_visitors');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getOrders() {
    try {
      const data = localStorage.getItem('crunch_cartel_orders');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // --- RENDER KEY PERFORMANCE INDICATORS ---
  renderKPIs() {
    const visitors = this.getVisitors();
    const orders = this.getOrders();

    const totalVisitors = visitors.length;
    const onlineVisitors = visitors.filter(v => v.isOnline || (v.lastSeen && Date.now() - v.lastSeen < 60000)).length || 1;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Calculate most popular item
    const itemCounts = {};
    orders.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(i => {
          itemCounts[i.name] = (itemCounts[i.name] || 0) + (i.quantity || 1);
        });
      }
    });

    let topItem = 'Kingpin Tower';
    let maxCount = 0;
    for (const [name, count] of Object.entries(itemCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topItem = name;
      }
    }

    const vCountEl = document.getElementById('kpiTotalVisitors');
    const vOnlineEl = document.getElementById('kpiOnlineVisitors');
    const oCountEl = document.getElementById('kpiTotalOrders');
    const revEl = document.getElementById('kpiTotalRevenue');
    const avgEl = document.getElementById('kpiAvgOrder');
    const topItemEl = document.getElementById('kpiTopItem');

    if (vCountEl) vCountEl.textContent = totalVisitors.toLocaleString();
    if (vOnlineEl) vOnlineEl.textContent = onlineVisitors.toLocaleString();
    if (oCountEl) oCountEl.textContent = totalOrders.toLocaleString();
    if (revEl) revEl.textContent = `Rs. ${totalRevenue.toLocaleString()}`;
    if (avgEl) avgEl.textContent = `Rs. ${avgOrderValue.toLocaleString()}`;
    if (topItemEl) topItemEl.textContent = topItem;
  }

  // --- RENDER VISITORS TABLE ---
  renderVisitorsTable() {
    const tableBody = document.getElementById('visitorsTableBody');
    if (!tableBody) return;

    let visitors = this.getVisitors();

    // Filter
    if (this.visitorFilter !== 'all') {
      if (this.visitorFilter === 'mobile') {
        visitors = visitors.filter(v => v.device === 'Mobile');
      } else if (this.visitorFilter === 'desktop') {
        visitors = visitors.filter(v => v.device === 'Desktop');
      } else if (this.visitorFilter === 'social') {
        visitors = visitors.filter(v => v.source && (v.source.includes('Facebook') || v.source.includes('Instagram')));
      }
    }

    if (this.searchVisitorText) {
      const q = this.searchVisitorText.toLowerCase();
      visitors = visitors.filter(v => 
        (v.id && v.id.toLowerCase().includes(q)) ||
        (v.city && v.city.toLowerCase().includes(q)) ||
        (v.source && v.source.toLowerCase().includes(q)) ||
        (v.browser && v.browser.toLowerCase().includes(q))
      );
    }

    if (visitors.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-5">
            <div class="empty-table-msg">
              <i class="fa-solid fa-users-slash"></i>
              <p>No customer visit records match the criteria.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    visitors.forEach(v => {
      const isOnline = v.isOnline || (v.lastSeen && Date.now() - v.lastSeen < 60000);
      const statusBadge = isOnline 
        ? '<span class="status-pill status-online"><i class="fa-solid fa-circle"></i> Online Now</span>'
        : '<span class="status-pill status-offline"><i class="fa-regular fa-circle"></i> Completed</span>';

      const deviceIcon = v.device === 'Mobile' ? 'fa-mobile-screen-button' : (v.device === 'Tablet' ? 'fa-tablet-screen-button' : 'fa-laptop');
      
      const actionsList = v.actions && v.actions.length > 0 
        ? v.actions.slice(0, 3).map(a => `<div class="visitor-action-crumb">• ${a}</div>`).join('') 
        : '<span class="text-muted">Browsing</span>';

      const sectionsList = v.sectionsViewed && v.sectionsViewed.length > 0
        ? v.sectionsViewed.map(s => `<span class="section-tag">${s}</span>`).join(' ')
        : '<span class="section-tag">HERO</span>';

      const durationMin = v.timeSpentSeconds ? `${Math.floor(v.timeSpentSeconds / 60)}m ${v.timeSpentSeconds % 60}s` : '< 1m';

      html += `
        <tr>
          <td>
            <div class="visitor-id-cell">
              <strong>${v.id}</strong>
              ${statusBadge}
            </div>
          </td>
          <td>
            <div class="visit-time-cell">
              <span class="time-main">${v.timeFormatted || 'Recent'}</span>
              <span class="date-sub">${v.dateFormatted || 'Today'}</span>
            </div>
          </td>
          <td>
            <div class="device-cell">
              <i class="fa-solid ${deviceIcon}"></i>
              <div>
                <span class="d-device">${v.device}</span>
                <span class="d-browser">${v.browser || 'Browser'} / ${v.os || 'OS'}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="location-cell">
              <i class="fa-solid fa-location-dot"></i>
              <span>${v.city || 'Karachi'}, ${v.country || 'Pakistan'}</span>
            </div>
          </td>
          <td>
            <span class="source-badge">${v.source || 'Direct'}</span>
          </td>
          <td>
            <div class="sections-wrap">${sectionsList}</div>
            <div class="actions-preview mt-1">${actionsList}</div>
          </td>
          <td>
            <span class="duration-badge">${durationMin}</span>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  }

  // --- RENDER ORDERS TABLE ---
  renderOrdersTable() {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    let orders = this.getOrders();

    if (this.orderFilter !== 'all') {
      orders = orders.filter(o => o.status.toLowerCase() === this.orderFilter.toLowerCase());
    }

    if (this.searchOrderText) {
      const q = this.searchOrderText.toLowerCase();
      orders = orders.filter(o =>
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.customerAddress && o.customerAddress.toLowerCase().includes(q))
      );
    }

    if (orders.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-5">
            <div class="empty-table-msg">
              <i class="fa-solid fa-receipt"></i>
              <p>No orders found matching the filter.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    orders.forEach(o => {
      const statusOptions = ['Pending', 'Cooking', 'On The Way', 'Delivered', 'Cancelled'];
      const statusSelectHtml = `
        <select class="order-status-select status-${o.status.toLowerCase().replace(/\s+/g, '-')}" onchange="cartelDashboard.updateStatus('${o.id}', this.value)">
          ${statusOptions.map(opt => `<option value="${opt}" ${opt.toLowerCase() === o.status.toLowerCase() ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      `;

      const itemsSummary = o.items ? o.items.map(i => `<b>${i.quantity}x</b> ${i.name}`).join(', ') : 'Custom Order';

      // WhatsApp Customer direct chat link
      const cleanPhone = o.customerPhone ? o.customerPhone.replace(/\D/g, '') : '';
      const waPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.substring(1) : cleanPhone;
      const waMsg = encodeURIComponent(`Hello ${o.customerName}! Your Crunch Cartel order #${o.id} is currently: ${o.status.toUpperCase()}. Thank you for choosing Crunch Cartel! Hotline: 0340 2402120`);
      const waLink = `https://wa.me/${waPhone}?text=${waMsg}`;

      html += `
        <tr>
          <td>
            <div class="order-id-cell">
              <strong class="text-primary">#${o.id}</strong>
              <span class="order-timestamp">${o.timeFormatted || 'Recent'}</span>
            </div>
          </td>
          <td>
            <div class="customer-info-cell">
              <span class="cust-name">${o.customerName}</span>
              <a href="tel:${o.customerPhone}" class="cust-phone"><i class="fa-solid fa-phone"></i> ${o.customerPhone}</a>
              <span class="cust-addr"><i class="fa-solid fa-location-dot"></i> ${o.customerAddress}</span>
              ${o.specialNotes && o.specialNotes !== 'None' ? `<span class="cust-notes"><i class="fa-solid fa-note-sticky"></i> "${o.specialNotes}"</span>` : ''}
            </div>
          </td>
          <td>
            <div class="order-items-cell">
              <div class="items-text">${itemsSummary}</div>
              <span class="payment-badge">${o.paymentMethod || 'COD'}</span>
            </div>
          </td>
          <td>
            <div class="order-total-cell">
              <span class="grand-total">Rs. ${(o.grandTotal || 0).toLocaleString()}</span>
              <span class="email-tag" title="Sent to ${CARTEL_INFO.email}"><i class="fa-solid fa-envelope-circle-check"></i> Dispatched to Email</span>
            </div>
          </td>
          <td>
            ${statusSelectHtml}
          </td>
          <td>
            <div class="order-actions-wrap">
              <a href="${waLink}" target="_blank" class="action-btn wa-btn" title="Send WhatsApp Update to Customer">
                <i class="fa-brands fa-whatsapp"></i>
              </a>
              <button class="action-btn print-btn" onclick="cartelDashboard.printReceipt('${o.id}')" title="Print Kitchen Receipt">
                <i class="fa-solid fa-print"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  }

  updateStatus(orderId, newStatus) {
    if (window.cartelTracker) {
      window.cartelTracker.updateOrderStatus(orderId, newStatus);
    } else {
      let orders = this.getOrders();
      const o = orders.find(item => item.id === orderId);
      if (o) {
        o.status = newStatus;
        localStorage.setItem('crunch_cartel_orders', JSON.stringify(orders));
      }
    }
    this.renderKPIs();
    this.renderOrdersTable();
    this.showToast(`Order #${orderId} marked as ${newStatus}`);
  }

  printReceipt(orderId) {
    const orders = this.getOrders();
    const o = orders.find(item => item.id === orderId);
    if (!o) return;

    const printWin = window.open('', '_blank', 'width=450,height=600');
    if (!printWin) {
      alert('Please allow popups to print receipt.');
      return;
    }

    const itemsRows = o.items.map(i => `
      <tr>
        <td style="padding:6px 0;">${i.quantity}x ${i.name}</td>
        <td style="text-align:right; padding:6px 0;">Rs. ${(i.price * i.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${o.id} - Crunch Cartel</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; font-size: 13px; margin: 20px; line-height: 1.4; color: #000; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
          .header h2 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
          .header p { margin: 4px 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          .total-row { font-weight: bold; font-size: 15px; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>CRUNCH CARTEL</h2>
          <p>More Taste, More Value.</p>
          <p>HOTLINE: 0340 2402120</p>
          <p>KITCHEN ORDER TICKET (KOT)</p>
        </div>
        <p><b>Order ID:</b> #${o.id}<br/>
        <b>Date:</b> ${o.dateFormatted || new Date().toLocaleDateString()} ${o.timeFormatted || ''}<br/>
        <b>Customer:</b> ${o.customerName}<br/>
        <b>Phone:</b> ${o.customerPhone}<br/>
        <b>Address:</b> ${o.customerAddress}<br/>
        <b>Payment:</b> ${o.paymentMethod || 'COD'}<br/>
        <b>Special Notes:</b> ${o.specialNotes || 'None'}</p>
        
        <div class="divider"></div>
        <table>
          <thead>
            <tr><th style="text-align:left;">Item</th><th style="text-align:right;">Total</th></tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <div class="divider"></div>
        <table>
          <tr><td>Subtotal:</td><td style="text-align:right;">Rs. ${(o.subtotal || 0).toLocaleString()}</td></tr>
          <tr><td>Delivery:</td><td style="text-align:right;">Rs. ${(o.deliveryFee || 150).toLocaleString()}</td></tr>
          <tr class="total-row"><td>GRAND TOTAL:</td><td style="text-align:right;">Rs. ${(o.grandTotal || 0).toLocaleString()}</td></tr>
        </table>
        <div class="divider"></div>
        <div class="footer">
          <p>Dispatched to: Cartelcrunch50@gmail.com</p>
          <p>Thank you for choosing Crunch Cartel!</p>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  }

  // --- ANALYTICS CHARTS & BREAKDOWNS ---
  renderAnalyticsCharts() {
    const visitors = this.getVisitors();
    const orders = this.getOrders();

    // Device breakdown
    const devices = { Mobile: 0, Desktop: 0, Tablet: 0 };
    visitors.forEach(v => {
      const d = v.device || 'Mobile';
      devices[d] = (devices[d] || 0) + 1;
    });

    const totalV = visitors.length || 1;
    const mobPct = Math.round((devices.Mobile / totalV) * 100);
    const dskPct = Math.round((devices.Desktop / totalV) * 100);
    const tabPct = 100 - mobPct - dskPct;

    const mobBar = document.getElementById('chartMobileBar');
    const dskBar = document.getElementById('chartDesktopBar');
    const tabBar = document.getElementById('chartTabletBar');
    const mobLabel = document.getElementById('chartMobileLabel');
    const dskLabel = document.getElementById('chartDesktopLabel');

    if (mobBar) mobBar.style.width = `${mobPct}%`;
    if (dskBar) dskBar.style.width = `${dskPct}%`;
    if (tabBar) tabBar.style.width = `${tabPct}%`;
    if (mobLabel) mobLabel.textContent = `${devices.Mobile} (${mobPct}%)`;
    if (dskLabel) dskLabel.textContent = `${devices.Desktop} (${dskPct}%)`;

    // Sources breakdown
    const sources = {};
    visitors.forEach(v => {
      const s = v.source || 'Direct';
      sources[s] = (sources[s] || 0) + 1;
    });

    const sourcesContainer = document.getElementById('trafficSourcesList');
    if (sourcesContainer) {
      let sHtml = '';
      for (const [src, count] of Object.entries(sources)) {
        const pct = Math.round((count / totalV) * 100);
        sHtml += `
          <div class="source-stat-item">
            <div class="source-info">
              <span>${src}</span>
              <b>${count} visits (${pct}%)</b>
            </div>
            <div class="source-progress"><div class="source-fill" style="width:${pct}%"></div></div>
          </div>
        `;
      }
      sourcesContainer.innerHTML = sHtml;
    }
  }

  exportVisitorsCSV() {
    const visitors = this.getVisitors();
    let csv = 'Visitor ID,Date,Time,Device,Browser,OS,City,Country,Source,Sections Viewed,Time Spent (s)\n';
    visitors.forEach(v => {
      const sections = (v.sectionsViewed || []).join(';');
      csv += `"${v.id}","${v.dateFormatted || ''}","${v.timeFormatted || ''}","${v.device}","${v.browser}","${v.os}","${v.city || ''}","${v.country || ''}","${v.source}","${sections}","${v.timeSpentSeconds || 0}"\n`;
    });

    this.downloadCSV(csv, `crunch_cartel_visitors_${Date.now()}.csv`);
  }

  exportOrdersCSV() {
    const orders = this.getOrders();
    let csv = 'Order ID,Customer Name,Phone,Address,Payment Method,Grand Total,Status,Date,Dispatched Email\n';
    orders.forEach(o => {
      csv += `"${o.id}","${o.customerName}","${o.customerPhone}","${o.customerAddress.replace(/"/g, '""')}","${o.paymentMethod}","${o.grandTotal}","${o.status}","${o.createdAt}","${o.emailRecipient || CARTEL_INFO.email}"\n`;
    });

    this.downloadCSV(csv, `crunch_cartel_orders_${Date.now()}.csv`);
  }

  downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast(`Exported ${filename}`);
  }

  addTestVisitor() {
    const cities = ['Karachi (DHA)', 'Karachi (Gulshan)', 'Karachi (Nazimabad)', 'Karachi (Bahria Town)', 'Lahore', 'Islamabad'];
    const sources = ['Instagram (@crunchcartel_)', 'Facebook (Cartel Share)', 'Direct / Search', 'WhatsApp Link'];
    const devices = ['Mobile', 'Desktop', 'Tablet'];
    
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const randomDevice = devices[Math.floor(Math.random() * devices.length)];

    const testV = {
      id: 'VIS-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      dateFormatted: 'Today',
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      device: randomDevice,
      browser: randomDevice === 'Desktop' ? 'Chrome' : 'Safari Mobile',
      os: randomDevice === 'Desktop' ? 'Windows' : 'iOS',
      city: randomCity,
      country: 'Pakistan',
      source: randomSource,
      sectionsViewed: ['HERO', 'BOSS DEALS', 'MENU'],
      actions: ['Just arrived', 'Browsing Deals'],
      timeSpentSeconds: 45,
      isOnline: true
    };

    let visitors = this.getVisitors();
    visitors.unshift(testV);
    localStorage.setItem('crunch_cartel_visitors', JSON.stringify(visitors));

    this.renderKPIs();
    this.renderVisitorsTable();
    this.renderAnalyticsCharts();
    this.showToast('Added Live Test Visitor!');
  }

  addTestOrder() {
    const testO = {
      id: 'CC-' + Math.floor(1000 + Math.random() * 9000),
      customerName: 'Zain Ul Abideen',
      customerPhone: '0340 2402120',
      customerAddress: 'Sunset Boulevard, Phase 2 Ext, DHA Karachi',
      specialNotes: 'Extra hot dip for the wings!',
      paymentMethod: 'Cash on Delivery (COD)',
      items: [
        { id: 'deal-1', name: 'Deal 1 (Boss of the Week)', price: 949, quantity: 1 },
        { id: 'kingpin-tower', name: 'Kingpin Tower', price: 599, quantity: 1 }
      ],
      subtotal: 1548,
      deliveryFee: 150,
      grandTotal: 1698,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      dateFormatted: 'Today',
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emailRecipient: CARTEL_INFO.email
    };

    let orders = this.getOrders();
    orders.unshift(testO);
    localStorage.setItem('crunch_cartel_orders', JSON.stringify(orders));

    this.renderKPIs();
    this.renderOrdersTable();
    this.renderAnalyticsCharts();
    this.showToast('Generated New Test Order!');
  }

  showToast(msg) {
    let t = document.getElementById('dashToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'dashToast';
      t.className = 'dash-toast';
      document.body.appendChild(t);
    }
    t.innerHTML = `<i class="fa-solid fa-bell"></i> ${msg}`;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2600);
  }

  startAutoRefresh() {
    this.autoRefreshInterval = setInterval(() => {
      this.renderKPIs();
      this.renderVisitorsTable();
      this.renderOrdersTable();
    }, 8000);
  }

  bindEvents() {
    // Tab switching (Visitors vs Orders vs Analytics)
    document.querySelectorAll('.dash-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        document.querySelectorAll('.dash-nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.dash-tab-content').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const target = document.getElementById(`tab-${tab}`);
        if (target) target.classList.add('active');
        this.activeTab = tab;
      });
    });

    // Visitor filter pills
    document.querySelectorAll('.v-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.v-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.visitorFilter = btn.getAttribute('data-filter');
        this.renderVisitorsTable();
      });
    });

    // Visitor Search input
    const vSearch = document.getElementById('visitorSearchInput');
    if (vSearch) {
      vSearch.addEventListener('input', (e) => {
        this.searchVisitorText = e.target.value.trim();
        this.renderVisitorsTable();
      });
    }

    // Order status filter pills
    document.querySelectorAll('.o-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.o-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.orderFilter = btn.getAttribute('data-filter');
        this.renderOrdersTable();
      });
    });

    // Order Search input
    const oSearch = document.getElementById('orderSearchInput');
    if (oSearch) {
      oSearch.addEventListener('input', (e) => {
        this.searchOrderText = e.target.value.trim();
        this.renderOrdersTable();
      });
    }

    // Export buttons
    const expV = document.getElementById('exportVisitorsBtn');
    if (expV) expV.addEventListener('click', () => this.exportVisitorsCSV());

    const expO = document.getElementById('exportOrdersBtn');
    if (expO) expO.addEventListener('click', () => this.exportOrdersCSV());

    // Test actions
    const testVBtn = document.getElementById('addTestVisitorBtn');
    if (testVBtn) testVBtn.addEventListener('click', () => this.addTestVisitor());

    const testOBtn = document.getElementById('addTestOrderBtn');
    if (testOBtn) testOBtn.addEventListener('click', () => this.addTestOrder());

    // Listen to real-time custom event from main site when order is placed
    window.addEventListener('cartel_order_placed', (e) => {
      this.renderKPIs();
      this.renderOrdersTable();
      this.renderAnalyticsCharts();
      this.showToast(`🚨 Live Order Received: #${e.detail.id}!`);
    });
  }
}

// Global Dashboard Instance with Admin Security Guard
document.addEventListener('DOMContentLoaded', () => {
  const lockScreen = document.getElementById('adminLockScreen');
  const dashboardApp = document.getElementById('dashboardApp');
  const lockAlert = document.getElementById('lockAlertMsg');
  const pwdInput = document.getElementById('adminPasswordInput');
  const toggleEyeBtn = document.getElementById('togglePasswordBtn');
  const toggleEyeIcon = document.getElementById('toggleEyeIcon');
  const changeModal = document.getElementById('changePasswordModal');
  const changeAlert = document.getElementById('changePwdAlert');

  function showDashboard() {
    if (lockScreen) lockScreen.style.display = 'none';
    if (dashboardApp) dashboardApp.style.display = 'block';
    if (!window.cartelDashboard) {
      window.cartelDashboard = new CartelDashboard();
    }
  }

  function showLockScreen() {
    if (lockScreen) lockScreen.style.display = 'flex';
    if (dashboardApp) dashboardApp.style.display = 'none';
    if (pwdInput) {
      pwdInput.value = '';
      setTimeout(() => pwdInput.focus(), 200);
    }
  }

  // Check initial authentication state
  if (window.AdminAuth && window.AdminAuth.isAuthenticated()) {
    showDashboard();
  } else {
    showLockScreen();
  }

  // Toggle password visibility
  if (toggleEyeBtn && pwdInput) {
    toggleEyeBtn.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      if (toggleEyeIcon) {
        toggleEyeIcon.classList.toggle('fa-eye', !isPwd);
        toggleEyeIcon.classList.toggle('fa-eye-slash', isPwd);
      }
    });
  }

  // Handle Admin Login
  window.handleAdminLogin = async function() {
    if (!pwdInput) return;
    const pwd = pwdInput.value.trim();
    if (!pwd) return;

    const ok = await window.AdminAuth.verifyPassword(pwd);
    if (ok) {
      window.AdminAuth.setAuthenticated(true);
      if (lockAlert) lockAlert.classList.remove('show');
      showDashboard();
      if (window.cartelDashboard) {
        window.cartelDashboard.showToast('👑 Welcome, Boss! Admin Command Center Unlocked.');
      }
    } else {
      if (lockAlert) {
        lockAlert.textContent = '❌ Incorrect password. Access denied.';
        lockAlert.classList.add('show');
      }
      pwdInput.value = '';
      pwdInput.focus();
    }
  };

  // Forgot / Reset Password Handler
  const forgotBtn = document.getElementById('forgotPwdBtn');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', async () => {
      const pin = prompt('Enter Crunch Cartel Hotline / Master Reset Key:');
      if (!pin) return;
      if (pin.trim() === '03402402120' || pin.trim() === '923402402120') {
        const newP = prompt('Enter new Master Admin Password (min 6 characters):');
        if (newP && newP.length >= 6) {
          const h = await window.AdminAuth.sha256(newP);
          window.AdminAuth.setStoredHash(h);
          alert('✅ Master Admin Password has been reset successfully! You can now log in.');
          if (lockAlert) lockAlert.classList.remove('show');
        } else if (newP) {
          alert('Password must be at least 6 characters.');
        }
      } else {
        alert('Invalid reset key.');
      }
    });
  }

  // Change Password Modal Controls
  const changeBtn = document.getElementById('changePasswordBtn');
  const closeChangeBtn = document.getElementById('closeChangePwdBtn');

  if (changeBtn && changeModal) {
    changeBtn.addEventListener('click', () => {
      changeModal.classList.add('active');
      if (changeAlert) changeAlert.classList.remove('show');
      document.getElementById('currentPasswordInput').value = '';
      document.getElementById('newPasswordInput').value = '';
      document.getElementById('confirmPasswordInput').value = '';
    });
  }

  if (closeChangeBtn && changeModal) {
    closeChangeBtn.addEventListener('click', () => {
      changeModal.classList.remove('active');
    });
  }

  window.handleChangePassword = async function() {
    const cur = document.getElementById('currentPasswordInput').value;
    const nw = document.getElementById('newPasswordInput').value;
    const conf = document.getElementById('confirmPasswordInput').value;

    if (nw !== conf) {
      if (changeAlert) {
        changeAlert.textContent = 'New passwords do not match.';
        changeAlert.classList.add('show');
      }
      return;
    }

    const res = await window.AdminAuth.updatePassword(cur, nw);
    if (res.success) {
      if (changeModal) changeModal.classList.remove('active');
      if (window.cartelDashboard) {
        window.cartelDashboard.showToast('✅ Admin password updated successfully!');
      }
    } else {
      if (changeAlert) {
        changeAlert.textContent = res.message;
        changeAlert.classList.add('show');
      }
    }
  };

  // Logout Handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Lock admin command center and log out?')) {
        window.AdminAuth.logout();
      }
    });
  }
});
