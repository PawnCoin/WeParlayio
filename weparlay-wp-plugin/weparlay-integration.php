<?php
/**
 * Plugin Name: WeParlay Fantasy Sports Integration
 * Description: Integrates the WeParlay Fantasy Sports platform with your WordPress site
 * Version: 1.0.0
 * Author: WeParlay
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('WEPARLAY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WEPARLAY_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WEPARLAY_VERSION', '1.0.0');

class WeParlay_Integration {
    /**
     * Plugin initialization
     */
    public function __construct() {
        // Register scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'register_assets'));
        
        // Add shortcode for embedding the app
        add_shortcode('weparlay_fantasy', array($this, 'fantasy_shortcode'));
        
        // Create Elementor widget if Elementor is active
        add_action('plugins_loaded', array($this, 'check_elementor_dependency'));
        
        // Include required files
        $this->include_files();
    }
    
    /**
     * Include required plugin files
     */
    private function include_files() {
        // REST API
        require_once WEPARLAY_PLUGIN_DIR . 'includes/rest-api.php';
        
        // Admin settings
        require_once WEPARLAY_PLUGIN_DIR . 'includes/admin-settings.php';
    }
    
    /**
     * Check if Elementor is active and register the widget if it is
     */
    public function check_elementor_dependency() {
        if (did_action('elementor/loaded')) {
            // Register Elementor widget
            add_action('elementor/widgets/widgets_registered', array($this, 'register_elementor_widget'));
        }
    }
    
    /**
     * Register assets (CSS and JS)
     */
    public function register_assets() {
        // Register React app bundle
        wp_register_script(
            'weparlay-fantasy-app',
            WEPARLAY_PLUGIN_URL . 'assets/js/fantasy-app.js',
            array(),
            WEPARLAY_VERSION,
            true
        );
        
        // Register styles
        wp_register_style(
            'weparlay-fantasy-styles',
            WEPARLAY_PLUGIN_URL . 'assets/css/fantasy-styles.css',
            array(),
            WEPARLAY_VERSION
        );
        
        // Localize script with settings
        wp_localize_script('weparlay-fantasy-app', 'weparlaySettings', array(
            'apiUrl' => rest_url('weparlay/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'theme' => array(
                'primary' => get_option('weparlay_primary_color', '#4B72FF'),
                'secondary' => get_option('weparlay_secondary_color', '#4AE3B5')
            ),
            'oddsApiKey' => get_option('weparlay_odds_api_key', '')
        ));
    }
    
    /**
     * Shortcode handler for fantasy app
     */
    public function fantasy_shortcode($atts) {
        // Parse attributes
        $atts = shortcode_atts(array(
            'sport_id' => '1',
            'contest_id' => '',
            'read_only' => 'false'
        ), $atts);
        
        // Enqueue required assets
        wp_enqueue_script('weparlay-fantasy-app');
        wp_enqueue_style('weparlay-fantasy-styles');
        
        // Return container for React app
        return '<div id="weparlay-fantasy-app-' . uniqid() . '" 
                     data-sport-id="' . esc_attr($atts['sport_id']) . '"
                     data-contest-id="' . esc_attr($atts['contest_id']) . '"
                     data-read-only="' . esc_attr($atts['read_only']) . '"
                     class="weparlay-app-container">
                </div>';
    }
    
    /**
     * Register Elementor widget
     */
    public function register_elementor_widget() {
        // Check if Elementor is loaded
        if (class_exists('Elementor\Widget_Base')) {
            require_once WEPARLAY_PLUGIN_DIR . 'widgets/elementor-weparlay-widget.php';
            \Elementor\Plugin::instance()->widgets_manager->register_widget_type(new \Elementor_WeParlay_Widget());
        }
    }
}

// Initialize the plugin
$weparlay_integration = new WeParlay_Integration();