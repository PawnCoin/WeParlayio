<?php
/**
 * Admin settings page for WeParlay integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class WeParlay_Admin_Settings {
    /**
     * Constructor - register hooks
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'admin_scripts'));
    }
    
    /**
     * Add menu item to WordPress admin
     */
    public function add_admin_menu() {
        add_menu_page(
            'WeParlay Settings',
            'WeParlay',
            'manage_options',
            'weparlay-settings',
            array($this, 'settings_page'),
            'dashicons-chart-area',
            20
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('weparlay_settings', 'weparlay_primary_color');
        register_setting('weparlay_settings', 'weparlay_secondary_color');
        register_setting('weparlay_settings', 'weparlay_odds_api_key');
    }
    
    /**
     * Enqueue admin scripts
     */
    public function admin_scripts($hook) {
        if ('toplevel_page_weparlay-settings' !== $hook) {
            return;
        }
        
        // Enqueue the WordPress color picker
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');
        
        // Enqueue custom admin script
        wp_enqueue_script(
            'weparlay-admin-script',
            WEPARLAY_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery', 'wp-color-picker'),
            WEPARLAY_VERSION,
            true
        );
    }
    
    /**
     * Render settings page
     */
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <form method="post" action="options.php">
                <?php settings_fields('weparlay_settings'); ?>
                <?php do_settings_sections('weparlay_settings'); ?>
                
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Primary Color</th>
                        <td>
                            <input type="text" name="weparlay_primary_color" 
                                value="<?php echo esc_attr(get_option('weparlay_primary_color', '#4B72FF')); ?>" 
                                class="weparlay-color-field" />
                            <p class="description">Primary brand color for buttons and accents</p>
                        </td>
                    </tr>
                    
                    <tr valign="top">
                        <th scope="row">Secondary Color</th>
                        <td>
                            <input type="text" name="weparlay_secondary_color" 
                                value="<?php echo esc_attr(get_option('weparlay_secondary_color', '#4AE3B5')); ?>" 
                                class="weparlay-color-field" />
                            <p class="description">Secondary brand color for highlights and accents</p>
                        </td>
                    </tr>
                    
                    <tr valign="top">
                        <th scope="row">The Odds API Key</th>
                        <td>
                            <input type="text" name="weparlay_odds_api_key" 
                                value="<?php echo esc_attr(get_option('weparlay_odds_api_key', '')); ?>" 
                                class="regular-text" />
                            <p class="description">
                                API key for <a href="https://the-odds-api.com/" target="_blank">The Odds API</a> 
                                for live betting odds. <a href="https://the-odds-api.com/#get-access" target="_blank">Get a key</a>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
            
            <hr />
            
            <h2>Using the WeParlay Fantasy Sports Integration</h2>
            
            <h3>Shortcode Usage</h3>
            <p>
                You can embed the WeParlay Fantasy Sports app anywhere on your site using the shortcode:
                <code>[weparlay_fantasy]</code>
            </p>
            
            <p>Optional shortcode attributes:</p>
            <ul>
                <li><code>sport_id</code> - ID of the sport (default: 1 for Basketball)</li>
                <li><code>contest_id</code> - ID of a specific contest (optional)</li>
                <li><code>read_only</code> - Set to "true" for read-only view (default: "false")</li>
            </ul>
            
            <p>Example: <code>[weparlay_fantasy sport_id="2" contest_id="12345" read_only="true"]</code></p>
            
            <h3>Elementor Widget</h3>
            <p>
                If you're using Elementor, you can add the WeParlay Fantasy Sports widget from the widget panel.
                The widget provides the same options as the shortcode, plus color customization.
            </p>
        </div>
        
        <script>
            jQuery(document).ready(function($) {
                $('.weparlay-color-field').wpColorPicker();
            });
        </script>
        <?php
    }
}

// Initialize the Admin Settings
new WeParlay_Admin_Settings();