#!/bin/bash

# WeParlay WordPress Plugin Build Script
# This script builds the React app for WordPress integration
# and packages everything into a distributable WordPress plugin

echo "=== Building WeParlay WordPress Plugin ==="

# Ensure we have the necessary packages
echo "Installing required dependencies..."
npm install --save-dev \
  webpack webpack-cli \
  mini-css-extract-plugin css-loader postcss-loader \
  terser-webpack-plugin css-minimizer-webpack-plugin \
  babel-loader @babel/core @babel/preset-env @babel/preset-react \
  @babel/preset-typescript @babel/plugin-transform-runtime

# Update package.json to include the WordPress build script
echo "Adding WordPress build script to package.json..."
# Using jq to add script if available, otherwise instruct the user
if command -v jq >/dev/null 2>&1; then
  jq '.scripts."build:wordpress" = "webpack --config webpack.wordpress.config.js"' package.json > package.json.tmp
  mv package.json.tmp package.json
else
  echo "Please add the following script to your package.json manually:"
  echo '"build:wordpress": "webpack --config webpack.wordpress.config.js"'
fi

# Create the WordPress integration file if it doesn't exist
if [ ! -f "client/src/wordpress-integration.js" ]; then
  echo "Creating WordPress integration entry point..."
  mkdir -p client/src
  cat > client/src/wordpress-integration.js << EOF
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FantasyTeamBuilder from './components/fantasy/FantasyTeamBuilder';
import './index.css';

// Create a client
const queryClient = new QueryClient();

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeWeParlay();
});

function initializeWeParlay() {
  // Find all WeParlay containers in the page
  const containers = document.querySelectorAll('.weparlay-app-container');
  
  containers.forEach(container => {
    // Get configuration from data attributes
    const sportId = parseInt(container.dataset.sportId || '1', 10);
    const contestId = container.dataset.contestId || undefined;
    const readOnly = container.dataset.readOnly === 'true';
    
    // Apply WordPress theme variables if available
    if (window.weparlaySettings && window.weparlaySettings.theme) {
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
        />
      </QueryClientProvider>,
      container
    );
  });
}

window.initializeWeParlay = initializeWeParlay;
EOF
fi

# Build the application for WordPress
echo "Building React application for WordPress..."
npm run build:wordpress

# Create CSS directory if it doesn't exist
mkdir -p weparlay-wp-plugin/assets/css

# Create the plugin .zip file
echo "Creating plugin zip file..."
cd weparlay-wp-plugin
zip -r ../weparlay-wp-plugin.zip ./*
cd ..

echo "=== Build Complete ==="
echo "WordPress plugin zip file created: weparlay-wp-plugin.zip"
echo ""
echo "Installation Instructions:"
echo "1. Log in to your WordPress admin panel"
echo "2. Go to Plugins > Add New > Upload Plugin"
echo "3. Select the weparlay-wp-plugin.zip file"
echo "4. Click 'Install Now'"
echo "5. Activate the plugin"
echo "6. Configure through the WeParlay menu in your WordPress admin"