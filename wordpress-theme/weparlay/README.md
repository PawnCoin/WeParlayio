# WeParlay WordPress Theme

This WordPress theme is designed to perfectly match the WeParlay sports betting app interface. It provides a seamless experience between your WordPress website and the WeParlay betting platform.

## Installation

1. Download this theme folder (the `weparlay` directory).
2. Log in to your WordPress admin dashboard.
3. Go to Appearance > Themes > Add New > Upload Theme.
4. Upload the zipped `weparlay` folder.
5. Activate the theme.

## Integration with WeParlay App

The theme includes an App Template that will display your WeParlay app from Replit in full-width inside WordPress.

### Setting up the App Template:

1. Go to Appearance > Customize > App Integration.
2. Enter your WeParlay app URL (e.g., `https://f7097b10-74b9-45ad-9152-e5c7329e5010-00-dwypxvoq2aso.worf.replit.dev`).
3. Choose whether to show the WordPress header and footer on app pages.
4. Save your changes.

### Creating an App Page:

1. Go to Pages > Add New.
2. Enter a title for your page (e.g., "Betting Platform").
3. In the Page Attributes section on the right sidebar, select "App Template" from the Template dropdown.
4. Publish the page.
5. This page will now display your WeParlay app within your WordPress site.

## Theme Customization

### Colors and Branding:

1. Go to Appearance > Customize > Colors.
2. Set your primary and secondary colors to match your branding.
3. These colors will be automatically synchronized with the app when using the App Template.

### Logo and Site Identity:

1. Go to Appearance > Customize > Site Identity.
2. Upload your site logo, set your site title and tagline.
3. These will appear in the header of your WordPress site.

## Betting Page Template

The theme includes a dedicated Betting Page template with built-in betting widgets:

1. Go to Pages > Add New.
2. Enter a title for your page (e.g., "Sports Betting").
3. In the Page Attributes section, select "Betting Page" from the Template dropdown.
4. Publish the page.
5. This page will display the betting interface with sports odds and selections.

## Shortcodes

The theme includes several shortcodes for displaying betting widgets on any page:

- `[live_betting]` - Shows live betting events.
- `[betting_slip]` - Displays a betting slip for selections.
- `[odds_comparison]` - Shows odds comparison across bookmakers.
- `[head_to_head]` - Displays head-to-head challenges.

### Shortcode Examples:

```
[live_betting title="Today's Live Games" sport="all" limit="5"]

[betting_slip title="My Bet Slip"]

[odds_comparison title="Best Odds" sport="all"]

[head_to_head title="Challenge a Friend"]
```

## Required Plugins

For optimal functionality, we recommend installing the following plugins:

1. Classic Editor - For easier editing of pages and posts.
2. Widget Logic - For conditional display of widgets.
3. WP Super Cache - For improved performance.

## Support

For support with this theme, please contact:

- Email: support@weparlay.io
- Website: weparlay.io