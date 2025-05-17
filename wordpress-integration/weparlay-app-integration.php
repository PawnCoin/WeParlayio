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
        add_options_page(
            'WeParlay App Settings',
            'WeParlay App',
            'manage_options',
            'weparlay-app-settings',
            array($this, 'settings_page')
        );
    }
    
    // Register settings
    public function register_settings() {
        register_setting('weparlay_app_settings', 'weparlay_app_url');
        register_setting('weparlay_app_settings', 'weparlay_app_page_id');
        register_setting('weparlay_app_settings', 'weparlay_header_include');
        register_setting('weparlay_app_settings', 'weparlay_footer_include');
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