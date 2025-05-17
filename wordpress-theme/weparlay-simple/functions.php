<?php
/**
 * WeParlay Simple Theme functions and definitions
 */

// Set up the theme
function weparlay_simple_setup() {
    // Add theme support for various features
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
    
    // Register navigation menus
    register_nav_menus(array(
        'primary' => 'Primary Menu',
    ));
}
add_action('after_setup_theme', 'weparlay_simple_setup');

// Enqueue styles and scripts
function weparlay_simple_scripts() {
    wp_enqueue_style('weparlay-style', get_stylesheet_uri());
}
add_action('wp_enqueue_scripts', 'weparlay_simple_scripts');

// Register template for app integration
function weparlay_simple_templates($templates) {
    $templates['template-app.php'] = 'App Template';
    return $templates;
}
add_filter('theme_page_templates', 'weparlay_simple_templates');

// Add customizer settings for app URL
function weparlay_simple_customize_register($wp_customize) {
    // Add section
    $wp_customize->add_section('weparlay_app_settings', array(
        'title' => 'App Integration',
        'priority' => 120,
    ));
    
    // Add setting for app URL
    $wp_customize->add_setting('app_url', array(
        'default' => 'https://f7097b10-74b9-45ad-9152-e5c7329e5010-00-dwypxvoq2aso.worf.replit.dev',
        'sanitize_callback' => 'esc_url_raw',
    ));
    
    // Add control for app URL
    $wp_customize->add_control('app_url', array(
        'label' => 'App URL',
        'section' => 'weparlay_app_settings',
        'type' => 'url',
        'description' => 'Enter the URL of your WeParlay application',
    ));
}
add_action('customize_register', 'weparlay_simple_customize_register');