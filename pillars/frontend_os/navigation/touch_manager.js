/**
 * /pillars/frontend_os/navigation/touch_manager.js
 * Mobile navigation gesture handling for the Frontend OS shell.
 *
 * This module intentionally lives in frontend_os.
 * It knows about the sidebar shell and is not shared UI infrastructure.
 */

import { state } from '../../../shared/core/state/index.js';

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

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.sidebar = document.querySelector('.nav-sidebar');
    this.mainContent = document.querySelector('.main-content');

    if (!this.sidebar || !this.mainContent) {
      return;
    }

    this._createBackdrop();
    this._bindEvents();
  }

  _createBackdrop() {
    const existing = document.getElementById('sidebar-backdrop');
    if (existing) existing.remove();

    this.backdrop = document.createElement('div');
    this.backdrop.id = 'sidebar-backdrop';
    this.backdrop.className = 'sidebar-backdrop';

    this.backdrop.addEventListener('click', () => this.closeSidebar());
    this.backdrop.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.closeSidebar();
    }, { passive: false });

    document.body.appendChild(this.backdrop);
  }

  _bindEvents() {
    this.mainContent.addEventListener('touchstart', (e) => this._handleTouchStart(e), { passive: true });
    this.mainContent.addEventListener('touchmove', (e) => this._handleTouchMove(e), { passive: true });
    this.mainContent.addEventListener('touchend', (e) => this._handleTouchEnd(), { passive: true });

    document.addEventListener('touchstart', (e) => this._handleEdgeSwipeStart(e), { passive: true });
    document.addEventListener('touchend', (e) => this._handleEdgeSwipeEnd(e), { passive: true });
  }

  _handleTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
    this.currentX = this.startX;
    this.currentY = this.startY;
    this.touchStartTime = Date.now();
    this.isDragging = false;
    this.swipeDirection = null;
  }

  _handleTouchMove(e) {
    if (!this.startX) return;

    this.currentX = e.touches[0].clientX;
    this.currentY = e.touches[0].clientY;

    const diffX = Math.abs(this.startX - this.currentX);
    const diffY = Math.abs(this.startY - this.currentY);
    const swipeThreshold = 50;
    const scrollLockAngle = 30;
    const angle = Math.abs(Math.atan2(diffY, diffX) * 180 / Math.PI);

    if (!this.swipeDirection && (diffX > 10 || diffY > 10)) {
      if (angle < scrollLockAngle) {
        this.swipeDirection = 'horizontal';
      } else if (angle > 60) {
        this.swipeDirection = 'vertical';
      }
    }

    if (this.swipeDirection === 'horizontal' && diffX >= swipeThreshold) {
      this.isDragging = true;
    }
  }

  _handleTouchEnd() {
    if (!this.startX) return;

    const diffX = this.startX - this.currentX;
    const diffY = Math.abs(this.startY - this.currentY);
    const diffTime = Date.now() - this.touchStartTime;
    const swipeThreshold = 50;
    const verticalTolerance = 30;
    const timeThreshold = 300;

    const isHorizontalSwipe = Math.abs(diffX) >= swipeThreshold;
    const isVerticalScroll = diffY > verticalTolerance;
    const isFastSwipe = diffTime < timeThreshold;

    if (this.isDragging && diffX > 0 && isHorizontalSwipe && !isVerticalScroll && isFastSwipe) {
      if (this.isSidebarOpen()) {
        this.closeSidebar();
      }
    }

    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.swipeDirection = null;
  }

  _handleEdgeSwipeStart(e) {
    if (e.touches[0].clientX < 20) {
      this.edgeStartX = e.touches[0].clientX;
      this.edgeStartY = e.touches[0].clientY;
      this.edgeStartTime = Date.now();
    }
  }

  _handleEdgeSwipeEnd(e) {
    if (!this.edgeStartX) return;

    const endX = e.changedTouches[0].clientX;
    const diffX = endX - this.edgeStartX;
    const diffY = Math.abs(e.changedTouches[0].clientY - this.edgeStartY);
    const diffTime = Date.now() - this.edgeStartTime;
    const swipeThreshold = 80;
    const timeThreshold = 400;

    if (diffX > swipeThreshold && diffTime < timeThreshold && diffX > diffY) {
      if (!this.isSidebarOpen()) {
        this.openSidebar();
      }
    }

    this.edgeStartX = null;
  }

  isSidebarOpen() {
    return this.sidebar && this.sidebar.classList.contains('open');
  }

  openSidebar() {
    if (!this.sidebar) return;

    this.sidebar.classList.add('open');
    this.backdrop.classList.add('active');
    document.body.classList.add('sidebar-open');

    state.emit('sidebarOpened', { source: 'touch' });
  }

  closeSidebar() {
    if (!this.sidebar) return;

    this.sidebar.classList.remove('open');
    this.backdrop.classList.remove('active');
    document.body.classList.remove('sidebar-open');

    state.emit('sidebarClosed', { source: 'touch' });
  }

  toggleSidebar() {
    if (this.isSidebarOpen()) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  destroy() {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    this.initialized = false;
  }
}

export const touchManager = new TouchManager();

export function initTouchGestures() {
  if (window.matchMedia('(pointer: coarse)').matches) {
    touchManager.init();
  }
}
