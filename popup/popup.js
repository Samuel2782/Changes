// Main popup functionality
class PopupManager {
    constructor() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    async checkAuthState() {
        const { user } = await chrome.storage.local.get('user');
        if (user) {
            document.getElementById('loginView').classList.remove('visible');
            document.getElementById('dashboardView').classList.add('visible');
        }
    }

    setupEventListeners() {
        // Summarize feature
        document.getElementById('summarizeBtn').addEventListener('click', async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Inject content script to get selected text
            const [{ result }] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => window.getSelection().toString()
            });

            if (!result) {
                alert('Please select some text to summarize');
                return;
            }

            // Send to background service worker for processing
            const summary = await chrome.runtime.sendMessage({
                type: 'SUMMARIZE',
                text: result
            });

            // Show summary in popup or inject into page
            // Implementation depends on your UI design
        });

        // Chat feature
        document.getElementById('chatBtn').addEventListener('click', async () => {
            // Open chat interface
            await chrome.runtime.sendMessage({
                type: 'OPEN_CHAT'
            });
        });

        // Tasks feature
        document.getElementById('tasksBtn').addEventListener('click', async () => {
            const tasks = await chrome.runtime.sendMessage({
                type: 'GET_TASKS'
            });

            // Show tasks in popup
            // Implementation depends on your UI design
        });
    }
}

// Initialize popup
const popup = new PopupManager();