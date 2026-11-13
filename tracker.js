// Crunch Cartel Customer Visitor & Activity Tracker
// Stores visitor logs and session data in localStorage for the Admin Dashboard

const TRACKER_STORAGE_KEY = 'crunch_cartel_visitors';
const ORDERS_STORAGE_KEY = 'crunch_cartel_orders';
const STATS_STORAGE_KEY = 'crunch_cartel_stats';

class CartelTracker {
  constructor() {
    this.sessionStartTime = Date.now();
    this.currentVisitor = null;
    this.init();
  }

  init() {
    this.seedInitialDataIfEmpty();
    this.recordCurrentVisit();
    this.setupSectionObserver();
    this.setupHeartbeat();
  }

  getDeviceType() {
    const width = window.innerWidth;
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || (width >= 768 && width <= 1024)) {
      return 'Tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua) || width < 768) {
      return 'Mobile';
    }
    return 'Desktop';
  }

  getBrowserOS() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown OS';

    if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('SamsungBrowser') > -1) browser = 'Samsung Internet';
    else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
    else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) browser = 'Microsoft Edge';
    else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';

    if (ua.indexOf('Win') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'macOS';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';

    return { browser, os };
  }

  getTrafficSource() {
    const ref = document.referrer;
    if (!ref) return 'Direct / Search';
    if (ref.includes('facebook.com')) return 'Facebook (Cartel Share)';
    if (ref.includes('instagram.com')) return 'Instagram (@crunchcartel_)';
    if (ref.includes('google.')) return 'Google Search';
    if (ref.includes('t.co') || ref.includes('twitter.com')) return 'Twitter / X';
    return ref.split('/')[2] || 'Referral';
  }

  recordCurrentVisit() {
    let visitorId = sessionStorage.getItem('cartel_session_id');
    const isNewSession = !visitorId;

    if (!visitorId) {
      visitorId = 'VIS-' + Math.floor(100000 + Math.random() * 900000);
      sessionStorage.setItem('cartel_session_id', visitorId);
    }

    const { browser, os } = this.getBrowserOS();
    const device = this.getDeviceType();
    const source = this.getTrafficSource();

    this.currentVisitor = {
      id: visitorId,
      timestamp: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timeFormatted: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      device: device,
      browser: browser,
      os: os,
      screenRes: `${window.screen.width}x${window.screen.height}`,
      source: source,
      sectionsViewed: ['Hero / Home'],
      actions: ['Arrived on website'],
      timeSpentSeconds: 0,
      isOnline: true
    };

    let visitors = this.getAllVisitors();
    const existingIndex = visitors.findIndex(v => v.id === visitorId);

    if (existingIndex >= 0) {
      this.currentVisitor = { ...visitors[existingIndex], isOnline: true };
    } else {
      visitors.unshift(this.currentVisitor);
      if (visitors.length > 200) visitors = visitors.slice(0, 200);
      localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(visitors));
    }

    // Try background geolocation lookup without blocking
    this.fetchApproxLocation(visitorId);
  }

  async fetchApproxLocation(visitorId) {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        let visitors = this.getAllVisitors();
        const v = visitors.find(item => item.id === visitorId);
        if (v) {
          v.city = data.city || 'Karachi';
          v.country = data.country_name || 'Pakistan';
          v.ip = data.ip ? data.ip.replace(/\.\d+$/, '.xxx') : '182.185.xxx.xxx';
          localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(visitors));
        }
      }
    } catch (e) {
      // Fallback
      let visitors = this.getAllVisitors();
      const v = visitors.find(item => item.id === visitorId);
      if (v && !v.city) {
        v.city = 'Karachi';
        v.country = 'Pakistan';
        v.ip = '182.185.74.xxx';
        localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(visitors));
      }
    }
  }

  trackAction(actionText) {
    const visitorId = sessionStorage.getItem('cartel_session_id');
    if (!visitorId) return;

    let visitors = this.getAllVisitors();
    const v = visitors.find(item => item.id === visitorId);
    if (v) {
      if (!v.actions) v.actions = [];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      v.actions.unshift(`[${timestamp}] ${actionText}`);
      if (v.actions.length > 15) v.actions = v.actions.slice(0, 15);
      localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(visitors));
    }
  }

  trackSection(sectionName) {
    const visitorId = sessionStorage.getItem('cartel_session_id');
    if (!visitorId) return;

    let visitors = this.getAllVisitors();
    const v = visitors.find(item => item.id === visitorId);
    if (v) {
      if (!v.sectionsViewed) v.sectionsViewed = [];
      if (!v.sectionsViewed.includes(sectionName)) {
        v.sectionsViewed.push(sectionName);
        localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(visitors));
      }
    }
  }

  setupSectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id || entry.target.getAttribute('data-section') || 'Section';
          const readable = sectionId.replace(/-/g, ' ').toUpperCase();
          this.trackSection(readable);
        }
      });
    }, { threshold: 0.3 });

    setTimeout(() => {
      document.querySelectorAll('section[id], header[id]').forEach(el => observer.observe(el));
    }, 1000);
  }

  setupHeartbeat() {
    setInterval(() => {
      const visitorId = sessionStorage.getItem('cartel_session_id');
      if (!visitorId) return;

      const elapsed = Math.round((Date.now() - this.sessionStartTime) / 1000);
      let visitors = this.getAllVisitors();
      const v = visitors.find(item => item.id === visitorId);
      if (v) {
        v.timeSpentSeconds = elapsed;
        v.lastSeen = Date.now();
        localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(visitors));
      }
    }, 10000);
  }

  getAllVisitors() {
    try {
      const data = localStorage.getItem(TRACKER_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getAllOrders() {
    try {
      const data = localStorage.getItem(ORDERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveOrder(order) {
    let orders = this.getAllOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    this.trackAction(`Placed Order #${order.id} for Rs. ${order.grandTotal.toLocaleString()}`);
    // Trigger custom event so any open dashboard or listeners react instantly
    window.dispatchEvent(new CustomEvent('cartel_order_placed', { detail: order }));
    return order;
  }

  updateOrderStatus(orderId, newStatus) {
    let orders = this.getAllOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      return true;
    }
    return false;
  }

  seedInitialDataIfEmpty() {
    const existingVisitors = localStorage.getItem(TRACKER_STORAGE_KEY);
    if (!existingVisitors || JSON.parse(existingVisitors).length === 0) {
      const seedVisitors = [
        {
          id: 'VIS-948210',
          timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          dateFormatted: 'Today',
          timeFormatted: 'Just now',
          device: 'Mobile',
          browser: 'Chrome Mobile',
          os: 'Android',
          screenRes: '390x844',
          city: 'Karachi (Gulshan)',
          country: 'Pakistan',
          ip: '182.185.12.xxx',
          source: 'Instagram (@crunchcartel_)',
          sectionsViewed: ['HERO', 'BOSS DEALS', 'MENU', 'CART'],
          actions: ['Viewed Deal 1', 'Added Kingpin Tower to cart', 'Checked delivery info'],
          timeSpentSeconds: 245,
          isOnline: true
        },
        {
          id: 'VIS-839102',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          dateFormatted: 'Today',
          timeFormatted: '45 mins ago',
          device: 'Desktop',
          browser: 'Chrome',
          os: 'Windows',
          screenRes: '1920x1080',
          city: 'Karachi (Clifton)',
          country: 'Pakistan',
          ip: '175.107.88.xxx',
          source: 'Direct / Search',
          sectionsViewed: ['HERO', 'MENU', 'CHICKEN', 'CARTEL COMBOS'],
          actions: ['Placed Order #CC-4902', 'Shared to WhatsApp'],
          timeSpentSeconds: 420,
          isOnline: false
        },
        {
          id: 'VIS-782914',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          dateFormatted: 'Today',
          timeFormatted: '2 hours ago',
          device: 'Mobile',
          browser: 'Safari',
          os: 'iOS',
          screenRes: '414x896',
          city: 'Karachi (DHA Phase 6)',
          country: 'Pakistan',
          ip: '119.160.65.xxx',
          source: 'Facebook (Cartel Share)',
          sectionsViewed: ['HERO', 'BOSS DEALS', 'CONTACT'],
          actions: ['Called Hotline 0340 2402120', 'Viewed Deal 3'],
          timeSpentSeconds: 180,
          isOnline: false
        },
        {
          id: 'VIS-610294',
          timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
          dateFormatted: 'Today',
          timeFormatted: '4 hours ago',
          device: 'Mobile',
          browser: 'Chrome Mobile',
          os: 'Android',
          screenRes: '360x800',
          city: 'Karachi (North Nazimabad)',
          country: 'Pakistan',
          ip: '116.71.144.xxx',
          source: 'WhatsApp Link',
          sectionsViewed: ['HERO', 'MENU', 'FRIES'],
          actions: ['Added Loaded Fries to cart', 'Placed Order #CC-4889'],
          timeSpentSeconds: 310,
          isOnline: false
        },
        {
          id: 'VIS-529104',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
          dateFormatted: 'Yesterday',
          timeFormatted: '11:40 PM',
          device: 'Tablet',
          browser: 'Safari',
          os: 'iPadOS',
          screenRes: '820x1180',
          city: 'Karachi (PECHS)',
          country: 'Pakistan',
          ip: '202.163.78.xxx',
          source: 'Direct / Search',
          sectionsViewed: ['HERO', 'GALLERY', 'BOSS DEALS'],
          actions: ['Browsed photo gallery', 'Checked menu pricing'],
          timeSpentSeconds: 195,
          isOnline: false
        }
      ];
      localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(seedVisitors));
    }

    const existingOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!existingOrders || JSON.parse(existingOrders).length === 0) {
      const seedOrders = [
        {
          id: 'CC-4902',
          customerName: 'Hamza Khan',
          customerPhone: '0333 1234567',
          customerAddress: 'Apartment 4B, Creek Vista, Phase 8 DHA, Karachi',
          specialNotes: 'Extra spicy cartel sauce please!',
          paymentMethod: 'Cash on Delivery (COD)',
          items: [
            { id: 'deal-1', name: 'Deal 1 (Boss of the Week)', price: 949, quantity: 2 },
            { id: 'loaded-fries', name: 'Loaded Fries', price: 499, quantity: 1 }
          ],
          subtotal: 2397,
          deliveryFee: 150,
          grandTotal: 2547,
          status: 'Cooking',
          createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
          timeFormatted: '40 mins ago',
          emailSent: true,
          emailRecipient: 'Cartelcrunch50@gmail.com'
        },
        {
          id: 'CC-4889',
          customerName: 'Ayesha Siddiqui',
          customerPhone: '0321 9876543',
          customerAddress: 'House 72, Block B, North Nazimabad, Karachi',
          specialNotes: 'Call upon arrival at the gate.',
          paymentMethod: 'JazzCash / EasyPaisa',
          items: [
            { id: 'kingpin-tower', name: 'Kingpin Tower', price: 599, quantity: 1 },
            { id: 'cartel-wrap', name: 'Cartel Wrap', price: 269, quantity: 2 },
            { id: 'criminal-fries', name: 'Criminal Fries', price: 149, quantity: 1 }
          ],
          subtotal: 1286,
          deliveryFee: 150,
          grandTotal: 1436,
          status: 'Delivered',
          createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          timeFormatted: '3 hours ago',
          emailSent: true,
          emailRecipient: 'Cartelcrunch50@gmail.com'
        },
        {
          id: 'CC-4861',
          customerName: 'Bilal Ahmed',
          customerPhone: '0345 5551234',
          customerAddress: 'Flat 12, Gulshan-e-Iqbal Block 5, Near Disco Bakery',
          specialNotes: 'Do not ring bell, infant sleeping.',
          paymentMethod: 'Cash on Delivery (COD)',
          items: [
            { id: 'burger-empire', name: 'Burger Empire (Feast)', price: 2999, quantity: 1 }
          ],
          subtotal: 2999,
          deliveryFee: 150,
          grandTotal: 3149,
          status: 'Delivered',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          timeFormatted: 'Yesterday',
          emailSent: true,
          emailRecipient: 'Cartelcrunch50@gmail.com'
        }
      ];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(seedOrders));
    }
  }
}

// Global Tracker Instance
window.cartelTracker = new CartelTracker();
