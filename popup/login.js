// Firebase Authentication handling
class AuthManager {
    constructor() {
        this.auth = firebase.auth();
        this.setupAuthStateListener();
    }

    setupAuthStateListener() {
        this.auth.onAuthStateChanged(user => {
            if (user) {
                this.onSignInSuccess(user);
            } else {
                this.onSignOut();
            }
        });
    }

    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            return result.user;
        } catch (error) {
            console.error('Sign-in error:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
        } catch (error) {
            console.error('Sign-out error:', error);
            throw error;
        }
    }

    async onSignInSuccess(user) {
        // Store user info in chrome.storage
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };

        await chrome.storage.local.set({ user: userData });
        
        // Update UI
        document.getElementById('loginView').classList.remove('visible');
        document.getElementById('dashboardView').classList.add('visible');
    }

    async onSignOut() {
        // Clear user data from storage
        await chrome.storage.local.remove('user');
        
        // Update UI
        document.getElementById('dashboardView').classList.remove('visible');
        document.getElementById('loginView').classList.add('visible');
    }
}

// Initialize authentication
const authManager = new AuthManager();

// Setup event listeners
document.getElementById('googleSignIn').addEventListener('click', () => {
    authManager.signInWithGoogle();
});

document.getElementById('signOut').addEventListener('click', () => {
    authManager.signOut();
});