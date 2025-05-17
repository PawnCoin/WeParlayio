<?php
/**
 * Template Name: App Template
 *
 * This template is used to display the WeParlay App within WordPress
 *
 * @package WeParlay
 */

get_header();

// Get the app URL from theme customizer
$app_url = get_theme_mod('weparlay_app_url', 'https://f7097b10-74b9-45ad-9152-e5c7329e5010-00-dwypxvoq2aso.worf.replit.dev');

// Get theme settings to pass to the app
$primary_color = get_theme_mod('weparlay_primary_color', '#3498db');
$secondary_color = get_theme_mod('weparlay_secondary_color', '#2c3e50');
$bg_color = get_theme_mod('weparlay_bg_color', '#ffffff');
$text_color = get_theme_mod('weparlay_text_color', '#333333');
$button_style = get_theme_mod('weparlay_button_style', 'rounded');
$font_family = get_theme_mod('weparlay_font_family', 'Arial, sans-serif');
$layout = get_theme_mod('weparlay_layout', 'full-width');
$widget_order = get_theme_mod('weparlay_widget_order', 'betting-slip,odds-comparison,live-events,trending-bets,user-profile');
$widget_visible = get_theme_mod('weparlay_widget_visible', 'betting-slip,odds-comparison,live-events,trending-bets,user-profile');
$logo_url = get_theme_mod('weparlay_logo_url', '');
?>

<div class="app-template-page">
    <div class="app-container">
        <iframe 
            src="<?php echo esc_url($app_url); ?>" 
            id="weparlay-app-iframe" 
            class="app-iframe" 
            allowfullscreen
            data-primary-color="<?php echo esc_attr($primary_color); ?>"
            data-secondary-color="<?php echo esc_attr($secondary_color); ?>"
            data-bg-color="<?php echo esc_attr($bg_color); ?>"
            data-text-color="<?php echo esc_attr($text_color); ?>"
            data-button-style="<?php echo esc_attr($button_style); ?>"
            data-font-family="<?php echo esc_attr($font_family); ?>"
            data-layout="<?php echo esc_attr($layout); ?>"
            data-widget-order="<?php echo esc_attr($widget_order); ?>"
            data-widget-visible="<?php echo esc_attr($widget_visible); ?>"
            data-logo-url="<?php echo esc_url($logo_url); ?>"
        ></iframe>
    </div>
</div>

<!-- Load the iframe communication scripts -->
<script src="<?php echo get_template_directory_uri(); ?>/js/weparlay-iframe.js"></script>
<script src="<?php echo get_template_directory_uri(); ?>/js/weparlay-app.js"></script>

<?php
get_footer();