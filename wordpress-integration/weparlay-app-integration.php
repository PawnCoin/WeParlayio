<?php
/**
 * Plugin Name: WeParlay App Integration
 * Description: Seamlessly integrates the WeParlay betting platform with WordPress
 * Version: 1.0.0
 * Author: WeParlay
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class WeParlay_App_Integration {
    
    // App URL - change this after deployment
    private $app_url = 'https://your-app-name.replit.app';
    
    // Constructor
    public function __construct() {
        // Create custom page template
        add_filter('theme_page_templates', array($this, 'add_app_page_template'));
        add_filter('template_include', array($this, 'load_app_template'));
        
        // Add shortcode for embedding the app
        add_shortcode('weparlay_app', array($this, 'weparlay_app_shortcode'));
        
        // Register scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'register_scripts'));
        
        // Add settings page
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        
        // Create page on plugin activation
        register_activation_hook(__FILE__, array($this, 'create_app_page'));
    }
    
    // Register scripts and styles
    public function register_scripts() {
        wp_register_style('weparlay-app-style', plugin_dir_url(__FILE__) . 'css/weparlay-app.css', array(), '1.0.0');
        wp_register_script('weparlay-app-script', plugin_dir_url(__FILE__) . 'js/weparlay-app.js', array('jquery'), '1.0.0', true);
        
        // Pass variables to JavaScript
        wp_localize_script('weparlay-app-script', 'weparlayApp', array(
            'appUrl' => $this->get_app_url(),
            'isLoggedIn' => is_user_logged_in(),
            'wpNonce' => wp_create_nonce('weparlay_app_nonce'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'homeUrl' => home_url()
        ));
    }
    
    // Get app URL from settings or default
    public function get_app_url() {
        $saved_url = get_option('weparlay_app_url');
        return !empty($saved_url) ? $saved_url : $this->app_url;
    }
    
    // Add custom page template
    public function add_app_page_template($templates) {
        $templates['weparlay-app-template.php'] = 'WeParlay App';
        return $templates;
    }
    
    // Load the app template
    public function load_app_template($template) {
        $template_name = get_page_template_slug();
        
        if ('weparlay-app-template.php' === $template_name) {
            $template = plugin_dir_path(__FILE__) . 'templates/weparlay-app-template.php';
        }
        
        return $template;
    }
    
    // Shortcode for embedding the app
    public function weparlay_app_shortcode($atts) {
        wp_enqueue_style('weparlay-app-style');
        wp_enqueue_script('weparlay-app-script');
        
        $atts = shortcode_atts(array(
            'height' => '800px',
            'width' => '100%',
            'section' => '', // For loading specific sections of the app
        ), $atts);
        
        $app_url = $this->get_app_url();
        
        // Add section parameter if provided
        if (!empty($atts['section'])) {
            $app_url .= '/' . $atts['section'];
        }
        
        ob_start();
        ?>
        <div class="weparlay-app-container">
            <div class="weparlay-app-loader">
                <div class="weparlay-spinner"></div>
                <p>Loading WeParlay...</p>
            </div>
            <iframe 
                src="<?php echo esc_url($app_url); ?>" 
                class="weparlay-app-iframe"
                style="width: <?php echo esc_attr($atts['width']); ?>; height: <?php echo esc_attr($atts['height']); ?>;"
                frameborder="0"
                allowfullscreen>
            </iframe>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Create app page on plugin activation
    public function create_app_page() {
        // Check if page already exists
        $app_page = get_page_by_path('weparlay-app');
        
        if (!$app_page) {
            // Create page
            $page_id = wp_insert_post(array(
                'post_title' => 'WeParlay Betting Platform',
                'post_content' => '[weparlay_app]',
                'post_status' => 'publish',
                'post_type' => 'page',
                'page_template' => 'weparlay-app-template.php'
            ));
            
            if ($page_id) {
                update_option('weparlay_app_page_id', $page_id);
            }
        }
        
        // Create CSS directory and file if they don't exist
        $css_dir = plugin_dir_path(__FILE__) . 'css';
        if (!file_exists($css_dir)) {
            mkdir($css_dir, 0755, true);
        }
        
        $css_file = $css_dir . '/weparlay-app.css';
        if (!file_exists($css_file)) {
            file_put_contents($css_file, $this->get_default_css());
        }
        
        // Create JS directory and file if they don't exist
        $js_dir = plugin_dir_path(__FILE__) . 'js';
        if (!file_exists($js_dir)) {
            mkdir($js_dir, 0755, true);
        }
        
        $js_file = $js_dir . '/weparlay-app.js';
        if (!file_exists($js_file)) {
            file_put_contents($js_file, $this->get_default_js());
        }
        
        // Create templates directory and file if they don't exist
        $templates_dir = plugin_dir_path(__FILE__) . 'templates';
        if (!file_exists($templates_dir)) {
            mkdir($templates_dir, 0755, true);
        }
        
        $template_file = $templates_dir . '/weparlay-app-template.php';
        if (!file_exists($template_file)) {
            file_put_contents($template_file, $this->get_default_template());
        }
    }
    
    // Add admin menu
    public function add_admin_menu() {
        add_menu_page(
            'WeParlay App',
            'WeParlay App',
            'manage_options',
            'weparlay-app-settings',
            array($this, 'settings_page'),
            'dashicons-chart-area',
            30
        );
        
        add_submenu_page(
            'weparlay-app-settings',
            'Settings',
            'Settings',
            'manage_options',
            'weparlay-app-settings',
            array($this, 'settings_page')
        );
        
        add_submenu_page(
            'weparlay-app-settings',
            'App Appearance',
            'Appearance',
            'manage_options',
            'weparlay-app-appearance',
            array($this, 'appearance_page')
        );
        
        add_submenu_page(
            'weparlay-app-settings',
            'Widget Layout',
            'Layout',
            'manage_options',
            'weparlay-app-layout',
            array($this, 'layout_page')
        );
    }
    
    // Register settings
    public function register_settings() {
        // Basic settings
        register_setting('weparlay_app_settings', 'weparlay_app_url');
        register_setting('weparlay_app_settings', 'weparlay_app_page_id');
        register_setting('weparlay_app_settings', 'weparlay_header_include');
        register_setting('weparlay_app_settings', 'weparlay_footer_include');
        
        // Appearance settings
        register_setting('weparlay_app_appearance', 'weparlay_primary_color', array('default' => '#3498db'));
        register_setting('weparlay_app_appearance', 'weparlay_secondary_color', array('default' => '#2c3e50'));
        register_setting('weparlay_app_appearance', 'weparlay_background_color', array('default' => '#ffffff'));
        register_setting('weparlay_app_appearance', 'weparlay_text_color', array('default' => '#333333'));
        register_setting('weparlay_app_appearance', 'weparlay_font_family', array('default' => 'Arial, sans-serif'));
        register_setting('weparlay_app_appearance', 'weparlay_button_style', array('default' => 'rounded'));
        register_setting('weparlay_app_appearance', 'weparlay_logo_url');
        register_setting('weparlay_app_appearance', 'weparlay_app_layout', array('default' => 'full-width'));
        register_setting('weparlay_app_appearance', 'weparlay_app_css');
        register_setting('weparlay_app_appearance', 'weparlay_app_config');
        
        // Widget settings
        register_setting('weparlay_app_layout', 'weparlay_widget_order');
        register_setting('weparlay_app_layout', 'weparlay_visible_widgets');
        
        // Set default widget settings if not set
        if (!get_option('weparlay_widget_order')) {
            $default_widgets = array('betting-slip', 'odds-comparison', 'live-events', 'trending-bets', 'user-profile');
            update_option('weparlay_widget_order', json_encode($default_widgets));
        }
        
        if (!get_option('weparlay_visible_widgets')) {
            $default_visible = array('betting-slip', 'odds-comparison', 'live-events', 'trending-bets', 'user-profile');
            update_option('weparlay_visible_widgets', json_encode($default_visible));
        }
        
        // Register AJAX handler for syncing configuration
        add_action('wp_ajax_weparlay_sync_config', array($this, 'sync_config_ajax'));
    }
    
    // AJAX handler for syncing configuration
    public function sync_config_ajax() {
        // Check nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'weparlay_sync_nonce')) {
            wp_send_json_error(array('message' => 'Invalid security token'));
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'You do not have permission to sync settings'));
        }
        
        // Get the configuration
        $config = isset($_POST['config']) ? sanitize_text_field($_POST['config']) : '';
        
        if (empty($config)) {
            wp_send_json_error(array('message' => 'No configuration data received'));
        }
        
        // Store the configuration
        update_option('weparlay_app_config', $config);
        
        // Generate CSS from the config
        $config_array = json_decode($config, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $css = $this->generate_css_from_config($config_array);
            update_option('weparlay_app_css', $css);
        }
        
        // Success response
        wp_send_json_success(array('message' => 'Configuration synced successfully'));
    }
    
    // Generate CSS from config array
    private function generate_css_from_config($config) {
        if (!is_array($config) || empty($config)) {
            return '';
        }
        
        $css = ":root {\n";
        
        // Add colors
        if (isset($config['colors']) && is_array($config['colors'])) {
            foreach ($config['colors'] as $key => $color) {
                $css .= "  --weparlay-{$key}: {$color};\n";
            }
        }
        
        // Add fonts
        if (isset($config['fonts']) && is_array($config['fonts'])) {
            if (isset($config['fonts']['family'])) {
                $css .= "  --weparlay-font-family: {$config['fonts']['family']};\n";
            }
        }
        
        // Add button styles
        if (isset($config['buttons']) && is_array($config['buttons'])) {
            if (isset($config['buttons']['style'])) {
                $radius = $config['buttons']['style'] === 'rounded' ? '25px' : '4px';
                $css .= "  --weparlay-button-radius: {$radius};\n";
            }
        }
        
        $css .= "}\n\n";
        
        // Add basic element styling
        $css .= "body {\n";
        $css .= "  font-family: var(--weparlay-font-family);\n";
        $css .= "  background-color: var(--weparlay-background);\n";
        $css .= "  color: var(--weparlay-text);\n";
        $css .= "}\n\n";
        
        $css .= ".button, button, .btn, .btn-primary {\n";
        $css .= "  background-color: var(--weparlay-primary);\n";
        $css .= "  border-radius: var(--weparlay-button-radius);\n";
        $css .= "}\n\n";
        
        $css .= "header, .header, nav, .navbar {\n";
        $css .= "  background-color: var(--weparlay-secondary);\n";
        $css .= "}\n";
        
        return $css;
    }
    
    // Layout settings page
    public function layout_page() {
        // Enqueue media scripts for the logo uploader
        wp_enqueue_media();
        
        // Enqueue jQuery UI for the sortable widgets
        wp_enqueue_script('jquery-ui-sortable');
        
        // Enqueue the admin script
        wp_enqueue_script(
            'weparlay-app-configurator',
            plugin_dir_url(__FILE__) . 'weparlay-app-configurator.js',
            array('jquery', 'jquery-ui-sortable', 'wp-color-picker'),
            '1.0.0',
            true
        );
        
        // Pass data to the script
        wp_localize_script('weparlay-app-configurator', 'weparlayConfig', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('weparlay_sync_nonce')
        ));
        
        // Widget definitions
        $widgets = array(
            'betting-slip' => array(
                'name' => 'Betting Slip',
                'description' => 'Shows the current betting selections and allows bet placement.'
            ),
            'odds-comparison' => array(
                'name' => 'Odds Comparison',
                'description' => 'Compares odds from different bookmakers.'
            ),
            'live-events' => array(
                'name' => 'Live Events',
                'description' => 'Displays currently active sporting events.'
            ),
            'trending-bets' => array(
                'name' => 'Trending Bets',
                'description' => 'Shows popular bets among other users.'
            ),
            'user-profile' => array(
                'name' => 'User Profile',
                'description' => 'Quick access to user profile and account balance.'
            ),
            'social-feed' => array(
                'name' => 'Social Feed',
                'description' => 'Latest social activity from friends and followed users.'
            )
        );
        
        // Get current widget order and visibility
        $widget_order = json_decode(get_option('weparlay_widget_order', '[]'), true);
        $visible_widgets = json_decode(get_option('weparlay_visible_widgets', '[]'), true);
        
        // Ensure all widgets are in the order array
        foreach (array_keys($widgets) as $widget_id) {
            if (!in_array($widget_id, $widget_order)) {
                $widget_order[] = $widget_id;
            }
        }
        
        // Ensure the visible widgets array exists
        if (!is_array($visible_widgets)) {
            $visible_widgets = array_keys($widgets);
        }
        
        ?>
        <div class="wrap weparlay-admin-layout">
            <h1>WeParlay App Layout</h1>
            
            <p>Arrange and configure the widgets displayed in the app. Drag to reorder.</p>
            
            <div class="weparlay-admin-columns">
                <div class="weparlay-admin-column weparlay-widget-config">
                    <h2>Widget Configuration</h2>
                    
                    <input type="hidden" id="weparlay_widget_order" name="weparlay_widget_order" value="<?php echo esc_attr(json_encode($widget_order)); ?>" />
                    <input type="hidden" id="weparlay_visible_widgets" name="weparlay_visible_widgets" value="<?php echo esc_attr(json_encode($visible_widgets)); ?>" />
                    
                    <ul class="weparlay-widget-position">
                        <?php foreach ($widget_order as $widget_id): ?>
                            <?php if (isset($widgets[$widget_id])): ?>
                                <li class="weparlay-widget" data-widget-id="<?php echo esc_attr($widget_id); ?>">
                                    <div class="weparlay-widget-header">
                                        <span class="weparlay-widget-title"><?php echo esc_html($widgets[$widget_id]['name']); ?></span>
                                        <label class="weparlay-widget-visibility">
                                            <input type="checkbox" class="weparlay-widget-toggle" data-widget-id="<?php echo esc_attr($widget_id); ?>" <?php checked(in_array($widget_id, $visible_widgets)); ?>>
                                            Visible
                                        </label>
                                    </div>
                                    <div class="weparlay-widget-description">
                                        <?php echo esc_html($widgets[$widget_id]['description']); ?>
                                    </div>
                                </li>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </ul>
                </div>
                
                <div class="weparlay-admin-column weparlay-preview">
                    <h2>Layout Preview</h2>
                    <div class="weparlay-preview-panel">
                        <div class="weparlay-preview-header">
                            <img src="" class="weparlay-preview-logo" alt="Logo">
                            <span>WeParlay App</span>
                        </div>
                        
                        <div class="weparlay-preview-container">
                            <?php foreach ($widget_order as $widget_id): ?>
                                <?php if (isset($widgets[$widget_id])): ?>
                                    <div class="weparlay-preview-widget" data-widget-id="<?php echo esc_attr($widget_id); ?>" <?php if (!in_array($widget_id, $visible_widgets)) echo 'style="display:none;"'; ?>>
                                        <h3><?php echo esc_html($widgets[$widget_id]['name']); ?></h3>
                                        <div class="weparlay-preview-widget-content">
                                            <div class="weparlay-preview-placeholder"></div>
                                        </div>
                                    </div>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('weparlay_app_layout');
                submit_button('Save Layout');
                ?>
                
                <p class="submit">
                    <button id="weparlay-sync-now" class="button button-primary">Sync Layout with App</button>
                    <button id="weparlay-reset-defaults" class="button">Reset to Defaults</button>
                </p>
            </form>
            
            <style>
                .weparlay-admin-columns {
                    display: flex;
                    gap: 20px;
                    margin-top: 20px;
                }
                
                .weparlay-admin-column {
                    flex: 1;
                }
                
                .weparlay-widget-position {
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    padding: 10px;
                    border-radius: 4px;
                }
                
                .weparlay-widget {
                    background-color: #fff;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 10px;
                    margin-bottom: 10px;
                    cursor: move;
                }
                
                .weparlay-widget-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                
                .weparlay-widget-title {
                    font-weight: bold;
                }
                
                .weparlay-widget-description {
                    color: #666;
                    font-size: 12px;
                }
                
                .weparlay-preview-panel {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    overflow: hidden;
                    background-color: #fff;
                }
                
                .weparlay-preview-header {
                    background-color: #2c3e50;
                    color: #fff;
                    padding: 10px;
                    display: flex;
                    align-items: center;
                }
                
                .weparlay-preview-logo {
                    height: 30px;
                    margin-right: 10px;
                    max-width: 100px;
                    display: none;
                }
                
                .weparlay-preview-container {
                    padding: 15px;
                }
                
                .weparlay-preview-widget {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    margin-bottom: 15px;
                    overflow: hidden;
                }
                
                .weparlay-preview-widget h3 {
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 10px;
                    font-size: 14px;
                    border-bottom: 1px solid #ddd;
                }
                
                .weparlay-preview-widget-content {
                    padding: 10px;
                }
                
                .weparlay-preview-placeholder {
                    height: 80px;
                    background-color: #f9f9f9;
                    border-radius: 4px;
                }
                
                .weparlay-preview-button {
                    display: inline-block;
                    padding: 6px 12px;
                    background-color: #3498db;
                    color: #fff;
                    border-radius: 4px;
                    margin-top: 10px;
                    text-align: center;
                    cursor: pointer;
                }
            </style>
        </div>
        <?php
    }
    
    // Appearance settings page
    public function appearance_page() {
        // Enqueue media scripts for the logo uploader
        wp_enqueue_media();
        
        // Enqueue color picker
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');
        
        // Enqueue the admin script
        wp_enqueue_script(
            'weparlay-app-configurator',
            plugin_dir_url(__FILE__) . 'weparlay-app-configurator.js',
            array('jquery', 'wp-color-picker'),
            '1.0.0',
            true
        );
        
        // Pass data to the script
        wp_localize_script('weparlay-app-configurator', 'weparlayConfig', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('weparlay_sync_nonce')
        ));
        
        ?>
        <div class="wrap weparlay-admin-appearance">
            <h1>WeParlay App Appearance</h1>
            
            <p>Customize the look and feel of the WeParlay app to match your brand.</p>
            
            <div class="weparlay-admin-columns">
                <div class="weparlay-admin-column weparlay-appearance-config">
                    <form method="post" action="options.php">
                        <?php
                        settings_fields('weparlay_app_appearance');
                        ?>
                        
                        <h2>Colors</h2>
                        <table class="form-table">
                            <tr>
                                <th scope="row"><label for="weparlay_primary_color">Primary Color</label></th>
                                <td>
                                    <input type="text" class="weparlay-color-picker" id="weparlay_primary_color" name="weparlay_primary_color" value="<?php echo esc_attr(get_option('weparlay_primary_color', '#3498db')); ?>" data-default-color="#3498db" />
                                    <p class="description">Main color for buttons and important elements</p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><label for="weparlay_secondary_color">Secondary Color</label></th>
                                <td>
                                    <input type="text" class="weparlay-color-picker" id="weparlay_secondary_color" name="weparlay_secondary_color" value="<?php echo esc_attr(get_option('weparlay_secondary_color', '#2c3e50')); ?>" data-default-color="#2c3e50" />
                                    <p class="description">Used for header, navigation, and secondary elements</p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><label for="weparlay_background_color">Background Color</label></th>
                                <td>
                                    <input type="text" class="weparlay-color-picker" id="weparlay_background_color" name="weparlay_background_color" value="<?php echo esc_attr(get_option('weparlay_background_color', '#ffffff')); ?>" data-default-color="#ffffff" />
                                    <p class="description">Main page background color</p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><label for="weparlay_text_color">Text Color</label></th>
                                <td>
                                    <input type="text" class="weparlay-color-picker" id="weparlay_text_color" name="weparlay_text_color" value="<?php echo esc_attr(get_option('weparlay_text_color', '#333333')); ?>" data-default-color="#333333" />
                                    <p class="description">Default color for text content</p>
                                </td>
                            </tr>
                        </table>
                        
                        <h2>Typography</h2>
                        <table class="form-table">
                            <tr>
                                <th scope="row"><label for="weparlay_font_family">Font Family</label></th>
                                <td>
                                    <select id="weparlay_font_family" name="weparlay_font_family">
                                        <option value="Arial, sans-serif" <?php selected(get_option('weparlay_font_family', 'Arial, sans-serif'), 'Arial, sans-serif'); ?>>Arial</option>
                                        <option value="'Helvetica Neue', Helvetica, Arial, sans-serif" <?php selected(get_option('weparlay_font_family', 'Arial, sans-serif'), "'Helvetica Neue', Helvetica, Arial, sans-serif"); ?>>Helvetica</option>
                                        <option value="'Roboto', sans-serif" <?php selected(get_option('weparlay_font_family', 'Arial, sans-serif'), "'Roboto', sans-serif"); ?>>Roboto</option>
                                        <option value="'Open Sans', sans-serif" <?php selected(get_option('weparlay_font_family', 'Arial, sans-serif'), "'Open Sans', sans-serif"); ?>>Open Sans</option>
                                        <option value="'Lato', sans-serif" <?php selected(get_option('weparlay_font_family', 'Arial, sans-serif'), "'Lato', sans-serif"); ?>>Lato</option>
                                        <option value="'Poppins', sans-serif" <?php selected(get_option('weparlay_font_family', 'Arial, sans-serif'), "'Poppins', sans-serif"); ?>>Poppins</option>
                                        <option value="'Montserrat', sans-serif" <?php selected(get_option('weparlay_font_family', 'Arial, sans-serif'), "'Montserrat', sans-serif"); ?>>Montserrat</option>
                                        <option value="Georgia, serif" <?php selected(get_option('weparlay_font_family', 'Arial, sans-serif'), "Georgia, serif"); ?>>Georgia</option>
                                    </select>
                                    <p class="description">Primary font family for all text</p>
                                </td>
                            </tr>
                        </table>
                        
                        <h2>UI Elements</h2>
                        <table class="form-table">
                            <tr>
                                <th scope="row"><label for="weparlay_button_style">Button Style</label></th>
                                <td>
                                    <select id="weparlay_button_style" name="weparlay_button_style">
                                        <option value="rounded" <?php selected(get_option('weparlay_button_style', 'rounded'), 'rounded'); ?>>Rounded</option>
                                        <option value="square" <?php selected(get_option('weparlay_button_style', 'rounded'), 'square'); ?>>Square</option>
                                    </select>
                                    <p class="description">Shape style for buttons</p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><label for="weparlay-logo-url">Logo</label></th>
                                <td>
                                    <input type="text" id="weparlay-logo-url" name="weparlay_logo_url" value="<?php echo esc_attr(get_option('weparlay_logo_url')); ?>" class="regular-text" />
                                    <button id="weparlay-logo-upload-button" class="button">Upload Logo</button>
                                    <div class="logo-preview-container" style="margin-top: 10px;">
                                        <?php if (get_option('weparlay_logo_url')): ?>
                                            <img src="<?php echo esc_attr(get_option('weparlay_logo_url')); ?>" class="weparlay-logo-preview" style="max-height: 50px;" />
                                        <?php else: ?>
                                            <img src="" class="weparlay-logo-preview" style="max-height: 50px; display: none;" />
                                        <?php endif; ?>
                                    </div>
                                    <p class="description">Upload your logo for the app header</p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">Layout Style</th>
                                <td>
                                    <fieldset>
                                        <label>
                                            <input type="radio" name="weparlay_app_layout" value="full-width" <?php checked(get_option('weparlay_app_layout', 'full-width'), 'full-width'); ?> />
                                            Full-width (takes up entire screen)
                                        </label>
                                        <br>
                                        <label>
                                            <input type="radio" name="weparlay_app_layout" value="boxed" <?php checked(get_option('weparlay_app_layout', 'full-width'), 'boxed'); ?> />
                                            Boxed (centered with max-width)
                                        </label>
                                    </fieldset>
                                </td>
                            </tr>
                        </table>
                        
                        <input type="hidden" id="weparlay_app_css" name="weparlay_app_css" value="<?php echo esc_attr(get_option('weparlay_app_css', '')); ?>" />
                        <input type="hidden" id="weparlay_app_config" name="weparlay_app_config" value="<?php echo esc_attr(get_option('weparlay_app_config', '{}')); ?>" />
                        
                        <?php submit_button('Save Appearance'); ?>
                        
                        <p class="submit">
                            <button id="weparlay-sync-now" class="button button-primary">Sync Appearance with App</button>
                            <button id="weparlay-reset-defaults" class="button">Reset to Defaults</button>
                        </p>
                    </form>
                </div>
                
                <div class="weparlay-admin-column weparlay-preview">
                    <h2>Appearance Preview</h2>
                    <div class="weparlay-preview-panel">
                        <div class="weparlay-preview-header">
                            <img src="<?php echo esc_attr(get_option('weparlay_logo_url')); ?>" class="weparlay-preview-logo" alt="Logo" <?php if (!get_option('weparlay_logo_url')) echo 'style="display:none;"'; ?>>
                            <span>WeParlay App</span>
                        </div>
                        
                        <div class="weparlay-preview-container">
                            <div class="weparlay-preview-widget">
                                <h3>Live Events</h3>
                                <div class="weparlay-preview-widget-content">
                                    <div class="weparlay-preview-placeholder"></div>
                                    <div class="weparlay-preview-button">Place Bet</div>
                                </div>
                            </div>
                            
                            <div class="weparlay-preview-widget">
                                <h3>Betting Slip</h3>
                                <div class="weparlay-preview-widget-content">
                                    <div class="weparlay-preview-placeholder"></div>
                                    <div class="weparlay-preview-button">Confirm Bet</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .weparlay-admin-columns {
                    display: flex;
                    gap: 20px;
                    margin-top: 20px;
                }
                
                .weparlay-admin-column {
                    flex: 1;
                }
                
                .weparlay-preview-panel {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    overflow: hidden;
                    background-color: #fff;
                }
                
                .weparlay-preview-header {
                    background-color: #2c3e50;
                    color: #fff;
                    padding: 10px;
                    display: flex;
                    align-items: center;
                }
                
                .weparlay-preview-logo {
                    height: 30px;
                    margin-right: 10px;
                    max-width: 100px;
                }
                
                .weparlay-preview-container {
                    padding: 15px;
                }
                
                .weparlay-preview-widget {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    margin-bottom: 15px;
                    overflow: hidden;
                }
                
                .weparlay-preview-widget h3 {
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 10px;
                    font-size: 14px;
                    border-bottom: 1px solid #ddd;
                }
                
                .weparlay-preview-widget-content {
                    padding: 10px;
                }
                
                .weparlay-preview-placeholder {
                    height: 80px;
                    background-color: #f9f9f9;
                    border-radius: 4px;
                }
                
                .weparlay-preview-button {
                    display: inline-block;
                    padding: 6px 12px;
                    background-color: #3498db;
                    color: #fff;
                    border-radius: 4px;
                    margin-top: 10px;
                    text-align: center;
                    cursor: pointer;
                }
            </style>
        </div>
        <?php
    }
    
    // Settings page
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>WeParlay App Integration Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('weparlay_app_settings');
                do_settings_sections('weparlay_app_settings');
                ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">App URL</th>
                        <td>
                            <input type="text" name="weparlay_app_url" value="<?php echo esc_attr(get_option('weparlay_app_url', $this->app_url)); ?>" class="regular-text" />
                            <p class="description">Enter the URL of your WeParlay Replit app.</p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Include WordPress Header</th>
                        <td>
                            <input type="checkbox" name="weparlay_header_include" value="1" <?php checked(1, get_option('weparlay_header_include', 1), true); ?> />
                            <p class="description">Include the WordPress site header on the app page.</p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Include WordPress Footer</th>
                        <td>
                            <input type="checkbox" name="weparlay_footer_include" value="1" <?php checked(1, get_option('weparlay_footer_include', 1), true); ?> />
                            <p class="description">Include the WordPress site footer on the app page.</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            <div class="card">
                <h2>How to Use</h2>
                <p>Use the shortcode <code>[weparlay_app]</code> to embed the app on any page or post.</p>
                <p>Shortcode parameters:</p>
                <ul>
                    <li><code>height</code> - Set the height of the iframe (default: 800px)</li>
                    <li><code>width</code> - Set the width of the iframe (default: 100%)</li>
                    <li><code>section</code> - Load a specific section of the app (e.g., [weparlay_app section="betting"])</li>
                </ul>
                <p>You can also use the dedicated page template by selecting "WeParlay App" from the Page Attributes template dropdown.</p>
            </div>
        </div>
        <?php
    }
    
    // Default CSS for the app
    private function get_default_css() {
        return <<<CSS
/* WeParlay App Integration Styles */
.weparlay-app-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
}

.weparlay-app-iframe {
    border: none;
    width: 100vw;
    height: 100vh;
    max-width: 100%;
    min-height: 800px;
    background: transparent;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
}

/* Remove extra space in WordPress content area */
.content-area, 
.entry-content,
.site-content,
#content,
#primary,
#main,
article.page,
.page-content {
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
}

.weparlay-app-loader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f8f9fa;
    z-index: 10;
    transition: opacity 0.5s ease;
}

.weparlay-app-loader.hidden {
    opacity: 0;
    pointer-events: none;
}

.weparlay-spinner {
    border: 5px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 5px solid #3498db;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Match WordPress theme colors */
.weparlay-app-container {
    --weparlay-primary: var(--wp--preset--color--primary, #0073aa);
    --weparlay-secondary: var(--wp--preset--color--secondary, #23282d);
    --weparlay-background: var(--wp--preset--color--background, #ffffff);
    --weparlay-text: var(--wp--preset--color--text, #23282d);
}

/* Full-width template styles - takes up entire browser window */
.weparlay-fullwidth-template .weparlay-app-container {
    max-width: 100vw;
    width: 100vw;
    margin: 0;
    padding: 0;
}

.weparlay-fullwidth-template .weparlay-app-iframe {
    height: 100vh;
    min-height: 100vh;
}

/* Remove all WordPress margins and paddings when in full app mode */
.weparlay-fullwidth-template .site-content,
.weparlay-fullwidth-template .content-area,
.weparlay-fullwidth-template #primary,
.weparlay-fullwidth-template #main,
.weparlay-fullwidth-template .entry-content,
.weparlay-fullwidth-template article {
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
}
CSS;
    }
    
    // Default JS for the app
    private function get_default_js() {
        return <<<JS
(function($) {
    $(document).ready(function() {
        // Hide loader when iframe loads
        $('.weparlay-app-iframe').on('load', function() {
            $(this).parent().find('.weparlay-app-loader').addClass('hidden');
            
            // Match iframe height to content
            adjustIframeHeight(this);
            
            // Handle messages from the iframe
            setupPostMessageListener();
        });
        
        // Adjust iframe height based on content
        function adjustIframeHeight(iframe) {
            // Try to get the inner document height
            try {
                var height = Math.max(
                    800,
                    iframe.contentWindow.document.body.scrollHeight,
                    iframe.contentWindow.document.documentElement.scrollHeight
                );
                
                $(iframe).height(height + 50); // Add extra padding
            } catch(e) {
                // If cross-origin issues prevent access, set a fallback height
                console.log('Could not adjust iframe height: ', e);
            }
        }
        
        // Handle messages from the iframe
        function setupPostMessageListener() {
            window.addEventListener('message', function(event) {
                // Verify the origin matches your app URL
                if (event.origin !== weparlayApp.appUrl) {
                    return;
                }
                
                var data = event.data;
                
                // Handle navigation requests
                if (data.action === 'navigate') {
                    window.location.href = data.url;
                }
                
                // Handle resize requests
                if (data.action === 'resize') {
                    $('.weparlay-app-iframe').height(data.height + 50);
                }
                
                // Handle login/auth requests
                if (data.action === 'auth') {
                    // If WordPress login is needed, redirect to login page
                    if (!weparlayApp.isLoggedIn) {
                        window.location.href = weparlayApp.homeUrl + '/wp-login.php?redirect_to=' + encodeURIComponent(window.location.href);
                    }
                }
            });
        }
        
        // Send theme colors to the iframe
        function sendThemeColors() {
            var colors = {
                primary: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-primary').trim(),
                secondary: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-secondary').trim(),
                background: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-background').trim(),
                text: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-text').trim()
            };
            
            $('.weparlay-app-iframe').each(function() {
                try {
                    this.contentWindow.postMessage({
                        action: 'theme',
                        colors: colors
                    }, weparlayApp.appUrl);
                } catch(e) {
                    console.log('Could not send theme colors: ', e);
                }
            });
        }
        
        // Send theme colors once iframe is loaded
        setTimeout(sendThemeColors, 2000);
    });
})(jQuery);
JS;
    }
    
    // Default template for the app page
    private function get_default_template() {
        return <<<HTML
<?php
/**
 * Template Name: WeParlay App
 * 
 * A full-width template for the WeParlay app integration
 */

// Get header/footer inclusion settings
\$include_header = get_option('weparlay_header_include', 1);
\$include_footer = get_option('weparlay_footer_include', 1);

if (\$include_header) {
    get_header();
} else {
    // Minimal header if WordPress header is disabled
    ?><!DOCTYPE html>
    <html <?php language_attributes(); ?>>
    <head>
        <meta charset="<?php bloginfo('charset'); ?>">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <?php wp_head(); ?>
    </head>
    <body <?php body_class('weparlay-fullwidth-template'); ?>>
    <?php
}
?>

<div id="primary" class="content-area weparlay-app-page">
    <main id="main" class="site-main">
        <?php
        while (have_posts()) :
            the_post();
            
            // If the content has the shortcode, display it normally
            if (has_shortcode(get_the_content(), 'weparlay_app')) {
                the_content();
            } else {
                // Otherwise, add the shortcode
                echo do_shortcode('[weparlay_app height="1000px"]');
            }
            
        endwhile;
        ?>
    </main>
</div>

<?php
if (\$include_footer) {
    get_footer();
} else {
    // Minimal footer if WordPress footer is disabled
    wp_footer();
    ?>
    </body>
    </html>
    <?php
}
HTML;
    }
}

// Initialize the plugin
new WeParlay_App_Integration();