/**
 * WeParlay Iframe Communication Script
 * 
 * This script handles the safe communication between the WordPress site
 * and the WeParlay app iframe without violating cross-origin security restrictions.
 */

(function() {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Find the app iframe
    const appIframe = document.getElementById('weparlay-app-iframe');
    if (!appIframe) return;
    
    // Listen for messages from the iframe
    window.addEventListener('message', function(event) {
      // We don't check origin here to allow development environments,
      // but in production you might want to restrict this
      
      try {
        const message = event.data;
        
        // Handle resize message
        if (message && message.action === 'resize') {
          // Safely update iframe height
          if (message.height) {
            appIframe.style.height = message.height + 'px';
          }
          
          // Optionally update width if needed
          if (message.width) {
            // We usually don't change width as it's controlled by responsive CSS
            // appIframe.style.width = message.width + 'px';
          }
        }
        
        // Handle ready message
        if (message && message.action === 'ready') {
          console.log('WeParlay app is ready in iframe');
          
          // Apply initial height
          if (message.height) {
            appIframe.style.height = message.height + 'px';
          }
          
          // You could also send configuration settings here
          const config = getWordPressConfig();
          appIframe.contentWindow.postMessage({
            action: 'config',
            config: config
          }, '*');
        }
      } catch (error) {
        console.error('Error processing message from WeParlay app:', error);
      }
    });
    
    // Function to get WordPress configuration
    function getWordPressConfig() {
      // You could get this from WordPress settings or data attributes
      return {
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
    }
    
    // Set initial size
    appIframe.style.width = '100%';
    appIframe.style.minHeight = '700px'; // Fallback height before first message
  });
})();