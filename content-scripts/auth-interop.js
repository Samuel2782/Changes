// Handle communication between web auth and extension
class AuthInterop {
    constructor() {
        this.setupMessageListeners();
    }

    setupMessageListeners() {
        // Listen for messages from the web app
        window.addEventListener('message', async (event) => {
            // Verify origin
            if (event.origin !== 'https://yourdomain.com') return;

            switch (event.data.type) {
                case 'AUTH_SUCCESS':
                    await this.handleAuthSuccess(event.data.user);
                    break;
                case 'AUTH_LOGOUT':
                    await this.handleLogout();
                    break;
            }
        });

        // Listen for extension messages
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'CHECK_AUTH_STATUS') {
                this.checkAuthStatus().then(sendResponse);
                return true;
            }
        });
    }

    async handleAuthSuccess(user) {
        // Store auth data in chrome.storage
        await chrome.storage.local.set({
            authState: {
                user: user,
                timestamp: Date.now(),
                isAuthenticated: true
            }
        });

        // Notify extension
        chrome.runtime.sendMessage({
            type: 'AUTH_STATE_CHANGED',
            payload: { isAuthenticated: true, user }
        });
    }

    async handleLogout() {
        // Clear auth data
        await chrome.storage.local.remove('authState');

        // Notify extension
        chrome.runtime.sendMessage({
            type: 'AUTH_STATE_CHANGED',
            payload: { isAuthenticated: false }
        });
    }

    async checkAuthStatus() {
        const data = await chrome.storage.local.get('authState');
        if (!data.authState) return { isAuthenticated: false };

        // Check if token is expired (24 hour expiry)
        const isExpired = Date.now() - data.authState.timestamp > 24 * 60 * 60 * 1000;
        if (isExpired) {
            await this.handleLogout();
            return { isAuthenticated: false };
        }

        return {
            isAuthenticated: true,
            user: data.authState.user
        };
    }
}

// Initialize auth interop
new AuthInterop();