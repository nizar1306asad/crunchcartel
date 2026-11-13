// Crunch Cartel Main Application Engine
// GSAP Animations, Swiper Sliders, Dynamic Menu, Lightbox & Interactions

class CartelApp {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.init();
  }

  init() {
    this.renderCategoryPills();
    this.renderMenuItems();
    this.initSwiperSliders();
    this.initGsapAnimations();
    this.bindGlobalEvents();
    this.initMenuModal();
  }

  // --- RENDER MENU CATEGORY TABS ---
  renderCategoryPills() {
    const container = document.getElementById('menuCategoriesList');
    if (!container) return;

    let html = '';
    MENU_CATEGORIES.forEach(cat => {
      const activeClass = cat.id === this.currentCategory ? 'active' : '';
      const badgeHtml = cat.badge ? `<span class="cat-pill-badge">${cat.badge}</span>` : '';
      html += `
        <button type="button" class="category-pill ${activeClass}" data-category="${cat.id}">
          <i class="fa-solid ${cat.icon}"></i>
          <span>${cat.name}</span>
          ${badgeHtml}
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const catId = pill.getAttribute('data-category');
        this.selectCategory(catId);
      });
    });
  }

  selectCategory(catId) {
    this.currentCategory = catId;
    document.querySelectorAll('.category-pill').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-category') === catId);
    });
    this.renderMenuItems();
    if (window.cartelTracker) {
      window.cartelTracker.trackAction(`Filtered menu by category: ${catId}`);
    }
  }

  // --- RENDER MENU GRID ITEMS ---
  renderMenuItems() {
    const grid = document.getElementById('menuGridContainer');
    if (!grid) return;

    let filtered = MENU_ITEMS.filter(item => {
      const matchesCategory = this.currentCategory === 'all' || item.category === this.currentCategory;
      const matchesSearch = !this.searchQuery || 
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(this.searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="no-menu-results">
          <i class="fa-solid fa-face-frown-open"></i>
          <h3>No Items Found</h3>
          <p>No dishes matched "${this.searchQuery}". Try searching for Kingpin, Wrap, Wings, or Fries!</p>
          <button class="btn btn-secondary" onclick="cartelApp.resetMenuFilters()">Clear Search</button>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach((item, index) => {
      const originalPriceHtml = item.originalPrice ? `<span class="old-price">Rs. ${item.originalPrice.toLocaleString()}</span>` : '';
      const badgeHtml = item.badge ? `<div class="food-badge">${item.badge}</div>` : '';
      const tagsHtml = item.tags ? item.tags.map(t => `<span class="food-tag">${t}</span>`).join('') : '';

      html += `
        <div class="food-card" data-category="${item.category}" data-id="${item.id}" style="--stagger-delay: ${index * 0.05}s">
          <div class="food-card-media">
            ${badgeHtml}
            <div class="image-wrapper">
              <img src="${item.image}" alt="${item.name}" loading="lazy" />
            </div>
            <div class="card-media-overlay">
              <button class="quick-view-btn" onclick="cartelApp.previewItem('${item.id}')" title="Quick View">
                <i class="fa-solid fa-eye"></i> Quick View
              </button>
            </div>
          </div>
          <div class="food-card-body">
            <div class="food-meta-row">
              <span class="food-rating"><i class="fa-solid fa-star"></i> ${item.rating}</span>
              <span class="food-cat-label">${item.category.toUpperCase()}</span>
            </div>
            <h3 class="food-title">${item.name}</h3>
            <p class="food-desc">${item.description}</p>
            <div class="food-tags-row">${tagsHtml}</div>
            <div class="food-card-footer">
              <div class="food-price-wrap">
                <span class="currency">PKR</span>
                <span class="price-val">Rs. ${item.price.toLocaleString()}</span>
                ${originalPriceHtml}
              </div>
              <button class="btn-add-to-cart" onclick="cartelCart.addItem('${item.id}', 1)" title="Add to Order">
                <i class="fa-solid fa-cart-plus"></i>
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;

    // Trigger subtle entrance for food cards
    if (typeof gsap !== 'undefined') {
      try {
        gsap.from('.food-card', {
          opacity: 0,
          y: 20,
          duration: 0.4,
          stagger: 0.04,
          ease: 'power2.out',
          clearProps: 'all'
        });
      } catch (e) {}
    }
  }

  resetMenuFilters() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    const searchInput = document.getElementById('menuSearchInput');
    if (searchInput) searchInput.value = '';
    this.renderCategoryPills();
    this.renderMenuItems();
  }

  // --- SWIPER CAROUSEL INITIALIZATIONS ---
  initSwiperSliders() {
    if (typeof Swiper === 'undefined') return;

    // Boss Deals Carousel
    new Swiper('.boss-deals-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      pagination: {
        el: '.deals-swiper-pagination',
        clickable: true
      },
      navigation: {
        nextEl: '.deals-swiper-next',
        prevEl: '.deals-swiper-prev'
      },
      breakpoints: {
        640: { slidesPerView: 1.2, spaceBetween: 20 },
        768: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 2.8, spaceBetween: 28 },
        1280: { slidesPerView: 3.2, spaceBetween: 32 }
      }
    });

    // Gallery / Food Showcase Swiper
    new Swiper('.cartel-gallery-swiper', {
      slidesPerView: 1.2,
      spaceBetween: 18,
      centeredSlides: true,
      loop: true,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false
      },
      pagination: {
        el: '.gallery-swiper-pagination',
        clickable: true
      },
      navigation: {
        nextEl: '.gallery-swiper-next',
        prevEl: '.gallery-swiper-prev'
      },
      breakpoints: {
        540: { slidesPerView: 2, spaceBetween: 20, centeredSlides: false },
        768: { slidesPerView: 3, spaceBetween: 24, centeredSlides: false },
        1024: { slidesPerView: 4, spaceBetween: 24, centeredSlides: false },
        1380: { slidesPerView: 4.5, spaceBetween: 30, centeredSlides: false }
      }
    });

    // Customer Reviews Swiper
    new Swiper('.reviews-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      pagination: {
        el: '.reviews-swiper-pagination',
        clickable: true
      },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 30 }
      }
    });
  }

  // --- GSAP ANIMATIONS & SCROLLTRIGGERS ---
  initGsapAnimations() {
    if (typeof gsap === 'undefined') return;

    // Register ScrollTrigger if available
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Hero Smooth Motion (Always Visible & Animated)
    if (typeof gsap !== 'undefined') {
      try {
        gsap.from('.hero-badge-tag', { y: -15, duration: 0.6, ease: 'power2.out', clearProps: 'transform' });
        gsap.from('.hero-main-title .line-1', { x: -25, duration: 0.6, ease: 'power2.out', clearProps: 'transform' });
        gsap.from('.hero-main-title .line-2', { x: -25, duration: 0.6, ease: 'power2.out', clearProps: 'transform' });
        gsap.from('.hero-description', { y: 15, duration: 0.6, ease: 'power2.out', clearProps: 'transform' });
        gsap.from('.hero-cta-group .btn', { y: 15, duration: 0.5, stagger: 0.08, ease: 'power2.out', clearProps: 'transform' });
        gsap.from('.hero-stats-row .stat-pill', { y: 15, duration: 0.4, stagger: 0.08, ease: 'power2.out', clearProps: 'transform' });
        gsap.from('.hero-visual-container', { scale: 0.95, duration: 0.7, ease: 'power2.out', clearProps: 'transform' });
        gsap.from('.floating-hero-card', { y: 15, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)', clearProps: 'transform' });

        // Continuous floating animation
        gsap.to('.hero-food-plate', {
          y: 12,
          rotation: 0.5,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        gsap.to('.floating-badge-1', {
          y: -10,
          x: 5,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        gsap.to('.floating-badge-2', {
          y: 10,
          x: -6,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      } catch (err) {
        console.warn('GSAP hero anim notice:', err);
      }
    }

    // 3. ScrollTrigger Reveals for Sections
    if (typeof ScrollTrigger !== 'undefined') {
      try {
        // Section Headers
        gsap.utils.toArray('.section-header').forEach(header => {
          gsap.from(header, {
            y: 25,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: header,
              start: 'top 92%',
              once: true
            }
          });
        });

        // Boss Deals Cards
        gsap.utils.toArray('.deal-card-box').forEach((card, idx) => {
          gsap.from(card, {
            y: 30,
            duration: 0.5,
            delay: idx * 0.05,
            ease: 'power2.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              once: true
            }
          });
        });

        // Cartel Story & Big Banner
        gsap.from('.story-content', {
          x: -25,
          duration: 0.7,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: '.cartel-story-section',
            start: 'top 85%',
            once: true
          }
        });

        gsap.from('.story-visual-wrap', {
          x: 25,
          duration: 0.7,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: '.cartel-story-section',
            start: 'top 85%',
            once: true
          }
        });

        // Footer Entrance
        gsap.from('.main-footer', {
          y: 20,
          duration: 0.6,
          clearProps: 'transform',
          scrollTrigger: {
            trigger: '.main-footer',
            start: 'top 95%',
            once: true
          }
        });
      } catch (err) {
        console.warn('ScrollTrigger notice:', err);
      }
    }
  }

  // --- ITEM QUICK PREVIEW MODAL ---
  previewItem(itemId) {
    const item = MENU_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById('itemPreviewModal');
    const overlay = document.getElementById('itemPreviewOverlay');
    if (!modal) return;

    document.getElementById('previewItemImg').src = item.image;
    document.getElementById('previewItemTitle').textContent = item.name;
    document.getElementById('previewItemCat').textContent = item.category.toUpperCase();
    document.getElementById('previewItemDesc').textContent = item.description;
    document.getElementById('previewItemPrice').textContent = `Rs. ${item.price.toLocaleString()}`;
    
    const tagsContainer = document.getElementById('previewItemTags');
    if (tagsContainer) {
      tagsContainer.innerHTML = item.tags ? item.tags.map(t => `<span class="food-tag">${t}</span>`).join('') : '';
    }

    const addBtn = document.getElementById('previewAddBtn');
    if (addBtn) {
      addBtn.onclick = () => {
        const qty = parseInt(document.getElementById('previewQtyInput').value) || 1;
        cartelCart.addItem(item.id, qty);
        this.closePreviewModal();
      };
    }

    document.getElementById('previewQtyInput').value = 1;

    modal.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.cartelTracker) {
      window.cartelTracker.trackAction(`Viewed details for: ${item.name}`);
    }
  }

  closePreviewModal() {
    const modal = document.getElementById('itemPreviewModal');
    const overlay = document.getElementById('itemPreviewOverlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- ORIGINAL MENU CARD LIGHTBOX MODAL ---
  initMenuModal() {
    const openBtns = document.querySelectorAll('.view-menu-card-btn');
    const modal = document.getElementById('menuCardModal');
    const overlay = document.getElementById('menuCardOverlay');
    const closeBtn = document.getElementById('menuCardCloseBtn');

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const page = btn.getAttribute('data-page') || '1';
        this.showMenuCard(page);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeMenuCard());
    if (overlay) overlay.addEventListener('click', () => this.closeMenuCard());
  }

  showMenuCard(page) {
    const modal = document.getElementById('menuCardModal');
    const overlay = document.getElementById('menuCardOverlay');
    const imgEl = document.getElementById('menuCardImg');
    const page1Btn = document.getElementById('menuPage1Toggle');
    const page2Btn = document.getElementById('menuPage2Toggle');

    if (imgEl) {
      imgEl.src = page === '2' ? 'assets/images/menu-page-2.jpg' : 'assets/images/menu-page-1.jpg';
    }

    if (page1Btn) page1Btn.classList.toggle('active', page === '1');
    if (page2Btn) page2Btn.classList.toggle('active', page === '2');

    if (modal) modal.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.cartelTracker) {
      window.cartelTracker.trackAction(`Opened High-Res Menu Card Page ${page}`);
    }
  }

  closeMenuCard() {
    const modal = document.getElementById('menuCardModal');
    const overlay = document.getElementById('menuCardOverlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
      const headerOffset = 90;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  bindGlobalEvents() {
    // Menu Search input
    const searchInput = document.getElementById('menuSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderMenuItems();
      });
    }

    // Mobile nav toggle
    const mobileNavBtn = document.getElementById('mobileNavToggle');
    const mobileMenu = document.getElementById('mobileNavMenu');
    if (mobileNavBtn && mobileMenu) {
      mobileNavBtn.addEventListener('click', () => {
        mobileNavBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
      });

      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileNavBtn.classList.remove('active');
          mobileMenu.classList.remove('active');
        });
      });
    }

    // Header scroll background effect
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.main-header');
      if (header) {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });

    // Preview Modal Quantity buttons
    const prevMinus = document.getElementById('previewQtyMinus');
    const prevPlus = document.getElementById('previewQtyPlus');
    const prevInput = document.getElementById('previewQtyInput');
    if (prevMinus && prevPlus && prevInput) {
      prevMinus.addEventListener('click', () => {
        let v = parseInt(prevInput.value) || 1;
        if (v > 1) prevInput.value = v - 1;
      });
      prevPlus.addEventListener('click', () => {
        let v = parseInt(prevInput.value) || 1;
        prevInput.value = v + 1;
      });
    }

    // Preview Modal Close buttons
    const previewClose = document.getElementById('previewCloseBtn');
    const previewOverlay = document.getElementById('itemPreviewOverlay');
    if (previewClose) previewClose.addEventListener('click', () => this.closePreviewModal());
    if (previewOverlay) previewOverlay.addEventListener('click', () => this.closePreviewModal());
  }
}

// Global Cartel Application Instance
document.addEventListener('DOMContentLoaded', () => {
  window.cartelApp = new CartelApp();
});
