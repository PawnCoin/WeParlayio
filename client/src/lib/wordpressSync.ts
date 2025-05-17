/**
 * WordPress Design Sync System
 * 
 * This module handles the synchronization of design settings between
 * WordPress and the app through configuration messages received via
 * the iframe parent window.
 */

interface DesignConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    family: string;
  };
  buttons: {
    style: 'rounded' | 'square';
  };
  logo: {
    url: string;
  };
  layout: 'full-width' | 'boxed';
  widgets: {
    order: string[];
    visible: string[];
  };
}

// Default configuration
const defaultConfig: DesignConfig = {
  colors: {
    primary: '#3498db',
    secondary: '#2c3e50',
    background: '#ffffff',
    text: '#333333'
  },
  fonts: {
    family: 'Arial, sans-serif'
  },
  buttons: {
    style: 'rounded'
  },
  logo: {
    url: ''
  },
  layout: 'full-width',
  widgets: {
    order: ['betting-slip', 'odds-comparison', 'live-events', 'trending-bets', 'user-profile'],
    visible: ['betting-slip', 'odds-comparison', 'live-events', 'trending-bets', 'user-profile']
  }
};

// Current configuration state
let currentConfig: DesignConfig = { ...defaultConfig };

/**
 * Apply the design configuration to the app
 */
function applyDesignConfig(config: DesignConfig) {
  // Store the current configuration
  currentConfig = { ...config };
  
  // Apply CSS variables
  document.documentElement.style.setProperty('--weparlay-primary', config.colors.primary);
  document.documentElement.style.setProperty('--weparlay-secondary', config.colors.secondary);
  document.documentElement.style.setProperty('--weparlay-background', config.colors.background);
  document.documentElement.style.setProperty('--weparlay-text', config.colors.text);
  document.documentElement.style.setProperty('--weparlay-font-family', config.fonts.family);
  document.documentElement.style.setProperty(
    '--weparlay-button-radius', 
    config.buttons.style === 'rounded' ? '25px' : '4px'
  );
  
  // Apply logo if provided
  if (config.logo.url) {
    const logoElements = document.querySelectorAll('.weparlay-logo') as NodeListOf<HTMLImageElement>;
    logoElements.forEach(logo => {
      logo.src = config.logo.url;
      logo.style.display = 'block';
    });
  }
  
  // Apply layout
  const appContainer = document.querySelector('.app-container');
  if (appContainer) {
    if (config.layout === 'boxed') {
      appContainer.classList.add('boxed-layout');
      appContainer.classList.remove('full-width-layout');
    } else {
      appContainer.classList.add('full-width-layout');
      appContainer.classList.remove('boxed-layout');
    }
  }
  
  // Apply widget visibility and order
  applyWidgetConfig(config.widgets);
  
  console.log('Applied WordPress design configuration', config);
}

/**
 * Apply widget configuration
 */
function applyWidgetConfig(widgetConfig: DesignConfig['widgets']) {
  const { order, visible } = widgetConfig;
  
  // Hide/show widgets based on visibility settings
  document.querySelectorAll('[data-widget-id]').forEach((widget) => {
    const widgetId = widget.getAttribute('data-widget-id');
    if (widgetId) {
      if (visible.includes(widgetId)) {
        (widget as HTMLElement).style.display = '';
      } else {
        (widget as HTMLElement).style.display = 'none';
      }
    }
  });
  
  // Reorder widgets based on order settings
  const widgetContainer = document.querySelector('.weparlay-widgets-container');
  if (widgetContainer) {
    const widgetElements: { [key: string]: HTMLElement } = {};
    
    // Collect all widgets
    document.querySelectorAll('[data-widget-id]').forEach((widget) => {
      const widgetId = widget.getAttribute('data-widget-id');
      if (widgetId) {
        widgetElements[widgetId] = widget as HTMLElement;
      }
    });
    
    // Clear the container
    widgetContainer.innerHTML = '';
    
    // Append widgets in the specified order
    order.forEach((widgetId) => {
      if (widgetElements[widgetId] && visible.includes(widgetId)) {
        widgetContainer.appendChild(widgetElements[widgetId]);
      }
    });
  }
}

/**
 * Initialize the message listener for WordPress design sync
 */
export function initWordPressSync() {
  // Apply default configuration
  applyDesignConfig(defaultConfig);
  
  // Listen for messages from the parent window (WordPress)
  window.addEventListener('message', (event) => {
    // Only accept messages from trusted domain (will be the WordPress site)
    // For development, we accept messages from any origin
    // In production, this should be restricted to the WordPress domain
    
    try {
      // Check if the message has the expected shape
      if (event.data && event.data.action === 'theme') {
        // Simple color theme sync
        const { colors } = event.data;
        if (colors) {
          const config = { ...currentConfig };
          config.colors = { ...colors };
          applyDesignConfig(config);
        }
      } else if (event.data && event.data.action === 'config') {
        // Full configuration sync
        const { config } = event.data;
        if (config) {
          applyDesignConfig(config);
        }
      } else if (event.data && event.data.action === 'requestResize') {
        // WordPress is requesting our current size
        sendSizeToParent();
      }
    } catch (error) {
      console.error('Error processing WordPress design message', error);
    }
  });
  
  // Helper function to send current size to parent
  function sendSizeToParent() {
    if (window.self !== window.top) {
      try {
        window.parent.postMessage({
          action: 'resize',
          height: document.documentElement.scrollHeight || document.body.scrollHeight,
          width: document.documentElement.scrollWidth || document.body.scrollWidth
        }, '*');
      } catch (error) {
        console.error('Error sending size to parent', error);
      }
    }
  }
  
  // Notify the parent window (WordPress) that we're ready to receive design updates
  try {
    // Only send the message if we're in an iframe
    if (window.self !== window.top) {
      // Set up regular height updates to avoid security errors
      setInterval(() => {
        window.parent.postMessage(
          { 
            action: 'resize', 
            height: document.documentElement.scrollHeight || document.body.scrollHeight,
            width: document.documentElement.scrollWidth || document.body.scrollWidth
          }, 
          '*' // Using * to work in all environments
        );
      }, 500);
      
      // Send initial ready message
      window.parent.postMessage(
        { 
          action: 'ready', 
          height: document.documentElement.scrollHeight || document.body.scrollHeight,
          width: document.documentElement.scrollWidth || document.body.scrollWidth
        }, 
        '*'
      );
    }
  } catch (error) {
    console.error('Error sending ready message to WordPress', error);
  }
}

/**
 * Get the current design configuration
 */
export function getDesignConfig(): DesignConfig {
  return { ...currentConfig };
}

export default {
  initWordPressSync,
  getDesignConfig
};