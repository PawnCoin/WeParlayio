/**
 * WeParlay App Integration Script
 * 
 * This script handles the integration between the WeParlay WordPress site
 * and the application iframe, supporting cross-origin communication.
 */

jQuery(document).ready(function($) {
    // Reference to the iframe
    var appIframe = document.getElementById('weparlay-app-iframe');
    if (!appIframe) return;
    
    // Set initial iframe styles
    appIframe.style.width = '100%';
    appIframe.style.minHeight = '800px';
    appIframe.style.border = 'none';
    
    // Handle messages from the iframe app
    window.addEventListener('message', function(event) {
        // Security Note: In production, you should validate the origin
        // if (event.origin !== expectedOrigin) return;
        
        try {
            const data = event.data;
            
            // Handle resize messages
            if (data && data.action === 'resize') {
                if (data.height) {
                    // Ensure minimum height and add padding
                    const height = Math.max(data.height, 600) + 50;
                    appIframe.style.height = height + 'px';
                }
            }
            
            // Handle 'ready' message from the app
            if (data && data.action === 'ready') {
                console.log('WeParlay app is ready');
                
                // Set initial height
                if (data.height) {
                    const height = Math.max(data.height, 600) + 50;
                    appIframe.style.height = height + 'px';
                }
                
                // Send configuration to the app
                sendConfigToApp();
            }
        } catch (err) {
            console.error('Error processing message from WeParlay app:', err);
        }
    });
    
    // Function to send configuration to the app
    function sendConfigToApp() {
        // Get configuration from data attributes
        const config = {
            colors: {
                primary: appIframe.getAttribute('data-primary-color') || '#3498db',
                secondary: appIframe.getAttribute('data-secondary-color') || '#2c3e50',
                background: appIframe.getAttribute('data-bg-color') || '#ffffff',
                text: appIframe.getAttribute('data-text-color') || '#333333'
            },
            fonts: {
                family: appIframe.getAttribute('data-font-family') || 'Arial, sans-serif'
            },
            buttons: {
                style: appIframe.getAttribute('data-button-style') || 'rounded'
            },
            logo: {
                url: appIframe.getAttribute('data-logo-url') || ''
            },
            layout: appIframe.getAttribute('data-layout') || 'full-width',
            widgets: {
                order: (appIframe.getAttribute('data-widget-order') || '').split(',').filter(Boolean),
                visible: (appIframe.getAttribute('data-widget-visible') || '').split(',').filter(Boolean)
            }
        };
        
        // Send configuration to the app
        appIframe.contentWindow.postMessage({
            action: 'config',
            config: config
        }, '*');
    }
});