import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FantasyTeamBuilder from './components/fantasy/FantasyTeamBuilder';
import './index.css'; // Include your styles

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// WordPress API client - adapts our API calls to work with WordPress REST API
const wpApiClient = {
  // Adapt our API calls to work with WordPress REST API
  get: async (endpoint) => {
    const apiUrl = window.weparlaySettings?.apiUrl || '/wp-json/weparlay/v1';
    const response = await fetch(`${apiUrl}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  post: async (endpoint, data) => {
    const apiUrl = window.weparlaySettings?.apiUrl || '/wp-json/weparlay/v1';
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.weparlaySettings?.nonce || '',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }
};

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeWeParlay();
});

function initializeWeParlay() {
  // Find all WeParlay containers in the page
  const containers = document.querySelectorAll('.weparlay-app-container');
  
  containers.forEach(container => {
    // Get configuration from container data attributes
    const sportId = parseInt(container.dataset.sportId || '1', 10);
    const contestId = container.dataset.contestId || undefined;
    const readOnly = container.dataset.readOnly === 'true';
    
    // Apply WordPress theme variables if available
    if (window.weparlaySettings && window.weparlaySettings.theme) {
      // Apply to the container instead of :root to avoid affecting the rest of the site
      container.style.setProperty('--primary', window.weparlaySettings.theme.primary);
      container.style.setProperty('--secondary', window.weparlaySettings.theme.secondary);
    }
  
    // Render the app in this container
    ReactDOM.render(
      <QueryClientProvider client={queryClient}>
        <FantasyTeamBuilder 
          sportId={sportId}
          contestId={contestId}
          readOnly={readOnly}
          apiClient={wpApiClient} // Pass WordPress API client to component
        />
      </QueryClientProvider>,
      container
    );
  });
}

// Expose initialization function to global scope for manual triggering if needed
window.initializeWeParlay = initializeWeParlay;