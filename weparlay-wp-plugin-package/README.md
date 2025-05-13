# WeParlay Fantasy Sports WordPress Plugin

This plugin integrates the WeParlay Fantasy Sports platform with your WordPress site, allowing you to add fantasy sports features to your website using Elementor or shortcodes.

## Installation

1. Upload the `weparlay-wp-plugin` folder to your WordPress plugins directory (usually `/wp-content/plugins/`).
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Configure the plugin settings through the WeParlay menu in your WordPress admin.

## Usage

### Using the Shortcode

You can add the WeParlay Fantasy Sports app to any page or post using the shortcode:

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

### Using the Elementor Widget

If you're using Elementor:

1. Edit a page with Elementor
2. Find the "WeParlay Fantasy Sports" widget in the Elementor widget panel
3. Drag it onto your page
4. Configure the widget settings:
   - Sport selection
   - Contest ID (optional)
   - Read Only mode
   - Color customization

## Settings

Configure the plugin through the WeParlay Settings page in your WordPress admin:

- **Primary Color**: Set the primary brand color
- **Secondary Color**: Set the secondary brand color
- **The Odds API Key**: Enter your API key for The Odds API integration

## Building for WordPress Integration

To prepare your React application for WordPress integration:

1. Add the WordPress build script to your package.json:
```json
"scripts": {
  "build:wordpress": "webpack --config webpack.wordpress.config.js"
}
```

2. Run the build command to generate the WordPress-compatible files:
```bash
npm run build:wordpress
```

3. Copy the generated files to the WordPress plugin:
   - `/weparlay-wp-plugin/assets/js/fantasy-app.js`
   - `/weparlay-wp-plugin/assets/css/fantasy-styles.css`

## Requirements

- WordPress 5.7 or higher
- PHP 7.3 or higher
- Elementor (optional, for widget support)

## Support

For support or feature requests, please contact [support@weparlay.io](mailto:support@weparlay.io)

## Version History

- 1.0.0: Initial release