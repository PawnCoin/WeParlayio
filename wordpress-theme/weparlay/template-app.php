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
?>

<div class="app-template-page">
    <div class="app-container">
        <iframe src="<?php echo esc_url($app_url); ?>" id="weparlay-app-iframe" class="app-iframe" allowfullscreen></iframe>
    </div>
</div>

<?php
get_footer();