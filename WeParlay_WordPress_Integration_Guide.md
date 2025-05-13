# WeParlay WordPress Integration Guide

## Overview

This guide explains how to integrate the WeParlay Fantasy Sports platform with your WordPress website using the custom WordPress plugin we've created. This integration allows you to embed our fantasy sports application into any page using either Elementor or shortcodes.

## What's Included

- **WordPress Plugin**: A complete plugin that integrates with Elementor and provides shortcode capability
- **REST API Integration**: Communication bridge between WordPress and our fantasy sports platform
- **Admin Settings**: Configure colors, API keys, and other settings
- **Elementor Widget**: Drag-and-drop widget for easy placement on Elementor pages

## Installation Instructions

### Method 1: Using the Plugin Archive

1. Download the `weparlay-wordpress-plugin.tar.gz` file
2. Extract the contents using a tool like 7-Zip, WinRAR, or the tar command:
   ```
   tar -xzvf weparlay-wordpress-plugin.tar.gz -C weparlay-plugin
   ```
3. Upload the entire `weparlay-plugin` folder to your WordPress site's `/wp-content/plugins/` directory
4. In your WordPress admin, go to Plugins > Installed Plugins
5. Find "WeParlay Fantasy Sports Integration" and click "Activate"

### Method 2: Manual Installation

1. Copy the `weparlay-wp-plugin` directory to your WordPress site's `/wp-content/plugins/` directory
2. In your WordPress admin, go to Plugins > Installed Plugins
3. Find "WeParlay Fantasy Sports Integration" and click "Activate"

## Configuration

1. After activation, go to WeParlay > Settings in your WordPress admin
2. Configure the following settings:
   - Primary Color: Set the main color for buttons and accents
   - Secondary Color: Set the secondary color for highlights
   - The Odds API Key: Enter your API key for odds data

## Using the Integration

### Method 1: Elementor Widget

1. Edit a page with Elementor
2. Find the "WeParlay Fantasy Sports" widget in the widget panel
3. Drag it onto your page
4. Configure the widget settings:
   - Sport ID: Select the sport (Basketball = 1, Football = 2, etc.)
   - Contest ID (optional): Specify a particular contest
   - Read Only: Enable for display-only mode
   - Colors: Customize the appearance (if you've enabled custom colors)

### Method 2: Shortcode

Add the WeParlay Fantasy Sports app to any page or post using this shortcode:

```
[weparlay_fantasy]
```

#### Shortcode Attributes

- `sport_id` - ID of the sport (default: 1 for Basketball)
- `contest_id` - ID of a specific contest (optional)
- `read_only` - Set to "true" for read-only view (default: "false")

Example:
```
[weparlay_fantasy sport_id="2" contest_id="12345" read_only="true"]
```

## Building and Customizing the Application

If you need to make changes to the React application, you'll need to rebuild it:

1. Update the React components in the `client/src` directory
2. Install the required build dependencies:
   ```
   npm install --save-dev webpack webpack-cli mini-css-extract-plugin css-loader postcss-loader terser-webpack-plugin css-minimizer-webpack-plugin babel-loader @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/plugin-transform-runtime
   ```
3. Run the webpack build:
   ```
   npx webpack --config webpack.wordpress.config.cjs
   ```
4. Copy the generated files to your plugin:
   - `weparlay-wp-plugin/assets/js/fantasy-app.js`
   - `weparlay-wp-plugin/assets/css/fantasy-styles.css`

## Technical Details

### Directory Structure

- `/weparlay-wp-plugin`: Main plugin directory
  - `/assets`: Contains JavaScript, CSS, and images
  - `/includes`: PHP files for REST API and admin settings
  - `/widgets`: Elementor widget definition
  - `weparlay-integration.php`: Main plugin file

### React Application

- The React application is bundled into a single JavaScript file
- The application connects to the WordPress REST API for data
- Theme colors are controlled via CSS variables that can be set in WordPress

### WordPress Integration

- The plugin uses the WordPress REST API to provide endpoints for the React app
- Data is proxied between the React app and external APIs like The Odds API
- Authentication is handled through WordPress user sessions

## Troubleshooting

### The application doesn't load

- Check that the plugin is activated
- Verify that the JavaScript console doesn't show any errors
- Make sure your WordPress theme isn't conflicting with the application styles

### API data isn't loading

- Verify that you've entered your Odds API key in the plugin settings
- Check that your server can make outbound HTTP requests
- Look for error messages in the browser console

### Styling issues

- If colors are inconsistent, check that you're using the correct color values in the plugin settings
- If the application layout is broken, try disabling other plugins to check for conflicts
- For Elementor-specific issues, try adjusting the widget's padding and margins

## Support

For additional support or customization assistance, please contact [support@weparlay.io](mailto:support@weparlay.io)