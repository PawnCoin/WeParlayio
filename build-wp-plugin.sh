#!/bin/bash

# Simple Build Script for WeParlay WordPress Plugin

echo "Building WeParlay WordPress Plugin..."

# Run webpack build
echo "Running webpack build..."
npx webpack --config webpack.wordpress.config.cjs

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build successful!"
  
  # Create directories if they don't exist
  mkdir -p weparlay-wp-plugin/assets/css
  mkdir -p weparlay-wp-plugin/assets/js
  mkdir -p weparlay-wp-plugin/assets/images
  
  # Create ZIP file of the plugin
  echo "Creating plugin ZIP file..."
  cd weparlay-wp-plugin
  if command -v zip >/dev/null 2>&1; then
    zip -r ../weparlay-wordpress-plugin.zip ./*
    echo "ZIP file created: weparlay-wordpress-plugin.zip"
  else
    echo "The 'zip' command is not available. Plugin files have been generated but no ZIP file created."
  fi
  cd ..
  
  echo ""
  echo "Installation Instructions:"
  echo "1. Download the weparlay-wp-plugin directory or the ZIP file"
  echo "2. In your WordPress admin, go to Plugins > Add New > Upload Plugin"
  echo "3. Upload the plugin ZIP file or extract the directory to wp-content/plugins/"
  echo "4. Activate the plugin"
  echo "5. Configure via the WeParlay menu in WordPress admin"
else
  echo "Build failed. Please check the error messages above."
fi