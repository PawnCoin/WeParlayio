/**
 * WeParlay App Integration
 * 
 * This script handles the secure communication between WordPress and the WeParlay app
 * in the iframe while respecting cross-origin security restrictions.
 */

(function($) {
    // Initialize when document is ready
    $(document).ready(function() {
        // Find the app iframe
        const appFrame = document.getElementById('weparlay-app-iframe');
        if (!appFrame) return;
        
        // Set initial iframe height
        appFrame.style.width = '100%';
        appFrame.style.height = '800px';
        appFrame.style.border = 'none';
        
        // Listen for messages from the iframe
        window.addEventListener('message', function(event) {
            try {
                // Process messages from the app
                const message = event.data;
                
                // Handle resize message
                if (message && message.action === 'resize') {
                    // Add padding to avoid scrollbars
                    const height = (message.height || 800) + 50;
                    appFrame.style.height = height + 'px';
                    console.log('Resized iframe to', height, 'px');
                }
                
                // Handle ready message
                if (message && message.action === 'ready') {
                    console.log('WeParlay app is ready');
                    
                    // Send configuration
                    sendAppConfiguration();
                }
            } catch (error) {
                console.error('Error handling message from WeParlay app:', error);
            }
        });
        
        // Function to send configuration to the app
        function sendAppConfiguration() {
            // Get configuration from app data attributes
            const config = {
                colors: {
                    primary: appFrame.getAttribute('data-primary-color') || '#3498db',
                    secondary: appFrame.getAttribute('data-secondary-color') || '#2c3e50',
                    background: appFrame.getAttribute('data-bg-color') || '#ffffff',
                    text: appFrame.getAttribute('data-text-color') || '#333333'
                },
                fonts: {
                    family: appFrame.getAttribute('data-font-family') || 'Arial, sans-serif'
                },
                buttons: {
                    style: appFrame.getAttribute('data-button-style') || 'rounded'
                },
                logo: {
                    url: appFrame.getAttribute('data-logo-url') || ''
                },
                layout: appFrame.getAttribute('data-layout') || 'full-width',
                widgets: {
                    order: (appFrame.getAttribute('data-widget-order') || '').split(',').filter(Boolean),
                    visible: (appFrame.getAttribute('data-widget-visible') || '').split(',').filter(Boolean)
                }
            };
            
            // Log the configuration for debugging
            console.log('Sending config to app:', config);
            
            // Send configuration to the app using postMessage
            // Use '*' for origin to work in all environments including development
            // In production, you'd want to specify the exact origin
            appFrame.contentWindow.postMessage({
                action: 'config',
                config: config
            }, '*');
        }
        
        // Set a fallback resize check to handle scrolling
        setInterval(function() {
            if (appFrame.contentWindow) {
                try {
                    appFrame.contentWindow.postMessage({ action: 'requestResize' }, '*');
                } catch (error) {
                    // Ignore cross-origin errors if they occur
                }
            }
        }, 2000);
    });
})(jQuery);