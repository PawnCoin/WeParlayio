<?php
/**
 * Template Name: App Template
 * 
 * This template displays the WeParlay app in an iframe
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>

<body <?php body_class('app-template-page'); ?>>
<?php wp_body_open(); ?>

<?php
// Get the app URL from theme settings
$app_url = get_theme_mod('app_url', 'https://f7097b10-74b9-45ad-9152-e5c7329e5010-00-dwypxvoq2aso.worf.replit.dev');
?>

<div class="app-container">
    <iframe src="<?php echo esc_url($app_url); ?>" id="weparlay-app-iframe" class="app-iframe" allowfullscreen></iframe>
</div>

<?php wp_footer(); ?>
</body>
</html>