// Content script for page interactions

// Styles for injected UI elements
const styles = `
.ai-assistant-overlay {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 16px;
    max-width: 400px;
    z-index: 999999;
}

.ai-assistant-close {
    position: absolute;
    top: 8px;
    right: 8px;
    cursor: pointer;
    padding: 4px;
}

.ai-assistant-content {
    margin-top: 8px;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// UI Component for showing results
class OverlayUI {
    constructor() {
        this.overlay = null;
    }

    show(content) {
        if (this.overlay) {
            this.hide();
        }

        this.overlay = document.createElement('div');
        this.overlay.className = 'ai-assistant-overlay';
        this.overlay.innerHTML = `
            <div class="ai-assistant-close">✕</div>
            <div class="ai-assistant-content">${content}</div>
        `;

        document.body.appendChild(this.overlay);

        this.overlay.querySelector('.ai-assistant-close').addEventListener('click', () => {
            this.hide();
        });
    }

    hide() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }
}

// Initialize UI
const ui = new OverlayUI();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'SHOW_SUMMARY':
            ui.show(`
                <h3>Summary</h3>
                <p>${message.summary}</p>
            `);
            break;

        case 'SHOW_CHAT':
            ui.show(`
                <h3>AI Chat</h3>
                <div>${message.content}</div>
            `);
            break;
    }
});

// Helper function to get selected text
function getSelectedText() {
    return window.getSelection().toString().trim();
}

// Export functions for popup script access
window.aiAssistant = {
    getSelectedText
};