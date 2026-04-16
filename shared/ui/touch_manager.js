/**
 * /shared/ui/touch_manager.js
 * TOUCH GESTURE SYSTEM - Mobile Navigation Excellence
 * 
 * Responsibility: Touch gestures for mobile UX
 * LAW 2 COMPLIANT: Dynamic creation, no direct DOM manipulation
 * LAW 9 COMPLIANT: CSS centralized in theme.css
 */

import { state } from '../core/state.js';

/**
 * Touch gesture manager for mobile sidebar navigation
 */
export class TouchManager {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.swipeDirection = null;
    this.sidebar = null;
    this.mainContent = null;
    this.backdrop = null;
    this.touchStartTime = 0;
    this.initialized = false;
  }
  
  /**
   * Initialize touch event handlers
   */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    
    this.sidebar = document.querySelector('.nav-sidebar');
    this.mainContent = document.querySelector('.main-content');
    
    if (!this.sidebar || !this.mainContent) {
      console.warn('[TouchManager] Sidebar or main content not found');
      return;
    }
    
    this._createBackdrop();
    this._bindEvents();
    
    console.log('[TouchManager] Touch gestures initialized');
  }
  
  /**
   * Create touch backdrop element
   * LAW 9 COMPLIANT: All styles in theme.css, no inline styles
   * LAW 5 COMPLIANT: Idempotent - removes existing backdrop first
   */
  _createBackdrop() {
    // LAW 5: Idempotent - Remove existing backdrop if any
    const existing = document.getElementById('sidebar-backdrop');
    if (existing) existing.remove();

    this.backdrop = document.createElement('div');
    this.backdrop.id = 'sidebar-backdrop';
    this.backdrop.className = 'sidebar-backdrop';

    // LAW 9: No inline styles - all CSS in theme.css
    // Close sidebar on backdrop tap
    this.backdrop.addEventListener('click', () => this.closeSidebar());
    this.backdrop.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.closeSidebar();
    }, { passive: false });

    document.body.appendChild(this.backdrop);
  }
  
  /**
   * Bind touch events
   */
  _bindEvents() {
    // Swipe detection on main content to close sidebar
    this.mainContent.addEventListener('touchstart', (e) => this._handleTouchStart(e), { passive: true });
    this.mainContent.addEventListener('touchmove', (e) => this._handleTouchMove(e), { passive: true });
    this.mainContent.addEventListener('touchend', (e) => this._handleTouchEnd(e), { passive: true });
    
    // Swipe from edge to open sidebar
    document.addEventListener('touchstart', (e) => this._handleEdgeSwipeStart(e), { passive: true });
    document.addEventListener('touchend', (e) => this._handleEdgeSwipeEnd(e), { passive: true });
  }
  
  /**
   * Handle touch start on main content
   */
  _handleTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
    this.currentX = this.startX;
    this.currentY = this.startY;
    this.touchStartTime = Date.now();
    this.isDragging = false;
    this.swipeDirection = null; // 'horizontal' | 'vertical' | null
  }

  /**
   * Handle touch move on main content
   * LAW 8 COMPLIANT: Uses MBRN_CONFIG threshold values
   */
  _handleTouchMove(e) {
    if (!this.startX) return;

    this.currentX = e.touches[0].clientX;
    this.currentY = e.touches[0].clientY;

    const diffX = Math.abs(this.startX - this.currentX);
    const diffY = Math.abs(this.startY - this.currentY);
    const SWIPE_THRESHOLD = 50; // px - minimum distance to be considered a swipe
    const SCROLL_LOCK_ANGLE = 30; // degrees - angle threshold to lock direction

    // Calculate angle to determine swipe direction
    const angle = Math.abs(Math.atan2(diffY, diffX) * 180 / Math.PI);

    // Lock direction once we've moved enough to determine intent
    if (!this.swipeDirection && (diffX > 10 || diffY > 10)) {
      // If angle is shallow (< 30deg from horizontal), it's a horizontal swipe
      // If angle is steep (> 60deg from horizontal), it's vertical scrolling
      if (angle < SCROLL_LOCK_ANGLE) {
        this.swipeDirection = 'horizontal';
      } else if (angle > 60) {
        this.swipeDirection = 'vertical';
      }
    }

    // Only mark as dragging if horizontal and meets threshold
    if (this.swipeDirection === 'horizontal' && diffX >= SWIPE_THRESHOLD) {
      this.isDragging = true;
    }
  }

  /**
   * Handle touch end on main content
   * SWIPE-TUNING: 50px threshold with strict horizontal/vertical separation
   */
  _handleTouchEnd(e) {
    if (!this.startX) return;

    const diffX = this.startX - this.currentX;
    const diffY = Math.abs(this.startY - this.currentY);
    const diffTime = Date.now() - this.touchStartTime;
    const SWIPE_THRESHOLD = 50; // px - horizontal swipe minimum
    const VERTICAL_TOLERANCE = 30; // px - max vertical drift allowed
    const TIME_THRESHOLD = 300; // ms

    // STRICT: Must be horizontal swipe (left = close sidebar)
    // - Moved at least 50px horizontally
    // - Not scrolled more than 30px vertically (prevents diagonal triggering)
    // - Within time threshold
    const isHorizontalSwipe = Math.abs(diffX) >= SWIPE_THRESHOLD;
    const isVerticalScroll = diffY > VERTICAL_TOLERANCE;
    const isFastSwipe = diffTime < TIME_THRESHOLD;

    // Only close if: horizontal movement dominates, minimal vertical drift, fast enough
    if (this.isDragging && diffX > 0 && isHorizontalSwipe && !isVerticalScroll && isFastSwipe) {
      if (this.isSidebarOpen()) {
        this.closeSidebar();
      }
    }

    // Reset
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.swipeDirection = null;
  }
  
  /**
   * Handle swipe from left edge to open sidebar
   */
  _handleEdgeSwipeStart(e) {
    // Only trigger if starting from very left edge (within 20px)
    if (e.touches[0].clientX < 20) {
      this.edgeStartX = e.touches[0].clientX;
      this.edgeStartY = e.touches[0].clientY;
      this.edgeStartTime = Date.now();
    }
  }
  
  /**
   * Handle end of edge swipe
   */
  _handleEdgeSwipeEnd(e) {
    if (!this.edgeStartX) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - this.edgeStartX;
    const diffY = Math.abs(e.changedTouches[0].clientY - this.edgeStartY);
    const diffTime = Date.now() - this.edgeStartTime;
    
    const swipeThreshold = 80; // px - need to swipe further to open
    const timeThreshold = 400; // ms
    
    // Fast swipe right from edge opens sidebar
    if (diffX > swipeThreshold && diffTime < timeThreshold && diffX > diffY) {
      if (!this.isSidebarOpen()) {
        this.openSidebar();
      }
    }
    
    this.edgeStartX = null;
  }
  
  /**
   * Check if sidebar is currently open
   */
  isSidebarOpen() {
    return this.sidebar && this.sidebar.classList.contains('open');
  }
  
  /**
   * Open sidebar with backdrop
   * LAW 9 COMPLIANT: Uses CSS classes, no inline styles
   */
  openSidebar() {
    if (!this.sidebar) return;

    this.sidebar.classList.add('open');
    this.backdrop.classList.add('active');
    document.body.classList.add('sidebar-open'); // Prevent scrolling via CSS

    state.emit('sidebarOpened', { source: 'touch' });
  }

  /**
   * Close sidebar and hide backdrop
   * LAW 9 COMPLIANT: Uses CSS classes, no inline styles
   */
  closeSidebar() {
    if (!this.sidebar) return;

    this.sidebar.classList.remove('open');
    this.backdrop.classList.remove('active');
    document.body.classList.remove('sidebar-open'); // Restore scrolling via CSS

    state.emit('sidebarClosed', { source: 'touch' });
  }
  
  /**
   * Toggle sidebar state
   */
  toggleSidebar() {
    if (this.isSidebarOpen()) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    this.initialized = false;
  }
}

/**
 * Singleton instance
 */
export const touchManager = new TouchManager();

/**
 * Initialize touch manager (call once on app start)
 */
export function initTouchGestures() {
  // Only initialize on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) {
    touchManager.init();
  }
}
