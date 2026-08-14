/**
 * Offline Detection System
 * Monitors network connectivity and provides user feedback
 */

class OfflineDetector {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineBannerId = 'offline-notification-banner';
        this.init();
    }

    init() {
        // Check initial connection status
        this.updateConnectionStatus();
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Periodic connectivity check (verify real connection)
        this.startPeriodicCheck();
    }

    updateConnectionStatus() {
        this.isOnline = navigator.onLine;
        console.log(`Connection status: ${this.isOnline ? 'Online' : 'Offline'}`);
    }

    handleOffline() {
        console.log('🔴 Connection lost - offline mode activated');
        this.isOnline = false;
        // Store current page URL for later redirect
        localStorage.setItem('lastPageBeforeOffline', window.location.href);
        this.showOfflineBanner();
    }

    handleOnline() {
        console.log('🟢 Connection restored - online mode activated');
        this.isOnline = true;
        this.hideOfflineBanner();
    }

    showOfflineBanner() {
        // Check if banner already exists
        if (document.getElementById(this.offlineBannerId)) {
            return;
        }

        // Create offline notification banner
        const banner = document.createElement('div');
        banner.id = this.offlineBannerId;
        banner.className = 'offline-banner';
        banner.innerHTML = `
            <div class="offline-banner-content">
                <div class="offline-banner-icon">📡</div>
                <div class="offline-banner-text">
                    <strong>You're Offline</strong>
                    <p>Some features may be limited. Your data will sync when connection is restored.</p>
                </div>
                <button class="offline-banner-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;

        // Inject styles if not already present
        if (!document.getElementById('offline-styles')) {
            const styles = document.createElement('style');
            styles.id = 'offline-styles';
            styles.textContent = `
                .offline-banner {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                    color: white;
                    z-index: 10000;
                    padding: 1rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    animation: slideDown 0.3s ease-out;
                }

                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .offline-banner-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    max-width: 1200px;
                    margin: 0 auto;
                    gap: 1rem;
                }

                .offline-banner-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .offline-banner-text {
                    flex-grow: 1;
                }

                .offline-banner-text strong {
                    display: block;
                    font-size: 1rem;
                    margin-bottom: 0.25rem;
                }

                .offline-banner-text p {
                    margin: 0;
                    font-size: 0.875rem;
                    opacity: 0.9;
                }

                .offline-banner-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 0.5rem 0.75rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1.25rem;
                    transition: background 0.2s;
                    flex-shrink: 0;
                }

                .offline-banner-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                /* Adjust body padding when banner is shown */
                body.has-offline-banner {
                    padding-top: 0; /* Banner is fixed, no need for padding */
                }

                @media (max-width: 640px) {
                    .offline-banner-content {
                        flex-direction: column;
                        text-align: center;
                    }

                    .offline-banner-icon {
                        order: 1;
                    }

                    .offline-banner-close {
                        order: 2;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.insertBefore(banner, document.body.firstChild);
        document.body.classList.add('has-offline-banner');
    }

    hideOfflineBanner() {
        const banner = document.getElementById(this.offlineBannerId);
        if (banner) {
            banner.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                banner.remove();
                document.body.classList.remove('has-offline-banner');
            }, 300);
        }
    }

    startPeriodicCheck() {
        // Check connectivity every 5 seconds
        setInterval(() => {
            this.verifyConnection();
        }, 5000);
    }

    verifyConnection() {
        // Try to fetch a small resource to verify real connectivity
        fetch('/fav.png', { method: 'HEAD', cache: 'no-cache' })
            .then(() => {
                if (!this.isOnline) {
                    this.isOnline = true;
                    this.handleOnline();
                }
            })
            .catch(() => {
                if (this.isOnline) {
                    this.isOnline = false;
                    this.handleOffline();
                }
            });
    }

    /**
     * Check if device is online
     * @returns {boolean}
     */
    static isOnline() {
        return navigator.onLine;
    }

    /**
     * Show offline page (used by service worker)
     */
    static showOfflinePage() {
        window.location.href = '/offline.html';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.offlineDetector = new OfflineDetector();
    });
} else {
    window.offlineDetector = new OfflineDetector();
}
