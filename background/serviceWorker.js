// Background service worker

// API endpoints configuration
const API_CONFIG = {
    baseUrl: 'YOUR_BACKEND_URL',
    endpoints: {
        summarize: '/summarize',
        chat: '/chat',
        tasks: '/tasks'
    }
};

// Helper function for API calls
async function callApi(endpoint, data) {
    const { user } = await chrome.storage.local.get('user');
    if (!user) {
        throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.uid}` // Adjust based on your auth system
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
}

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'summarize',
        title: 'Summarize Selection',
        contexts: ['selection']
    });
});

// Context menu handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'summarize') {
        try {
            const summary = await callApi(API_CONFIG.endpoints.summarize, {
                text: info.selectionText
            });

            // Send summary back to content script or popup
            chrome.tabs.sendMessage(tab.id, {
                type: 'SHOW_SUMMARY',
                summary
            });
        } catch (error) {
            console.error('Summarization failed:', error);
        }
    }
});

// Message handling from popup/content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'SUMMARIZE':
            handleSummarize(message.text).then(sendResponse);
            return true;

        case 'CHAT':
            handleChat(message.query).then(sendResponse);
            return true;

        case 'GET_TASKS':
            handleGetTasks().then(sendResponse);
            return true;
    }
});

// Handler functions
async function handleSummarize(text) {
    try {
        return await callApi(API_CONFIG.endpoints.summarize, { text });
    } catch (error) {
        console.error('Summarization failed:', error);
        throw error;
    }
}

async function handleChat(query) {
    try {
        return await callApi(API_CONFIG.endpoints.chat, { query });
    } catch (error) {
        console.error('Chat failed:', error);
        throw error;
    }
}

async function handleGetTasks() {
    try {
        return await callApi(API_CONFIG.endpoints.tasks);
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        throw error;
    }
}