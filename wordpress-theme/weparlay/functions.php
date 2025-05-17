<?php
/**
 * WeParlay Theme functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package WeParlay
 */

if (!defined('WEPARLAY_VERSION')) {
    // Replace the version number of the theme on each release.
    define('WEPARLAY_VERSION', '1.0.0');
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
function weparlay_setup() {
    /*
     * Make theme available for translation.
     * Translations can be filed in the /languages/ directory.
     */
    load_theme_textdomain('weparlay', get_template_directory() . '/languages');

    // Add default posts and comments RSS feed links to head.
    add_theme_support('automatic-feed-links');

    /*
     * Let WordPress manage the document title.
     * By adding theme support, we declare that this theme does not use a
     * hard-coded <title> tag in the document head, and expect WordPress to
     * provide it for us.
     */
    add_theme_support('title-tag');

    /*
     * Enable support for Post Thumbnails on posts and pages.
     *
     * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
     */
    add_theme_support('post-thumbnails');

    // This theme uses wp_nav_menu() in one location.
    register_nav_menus(
        array(
            'menu-1' => esc_html__('Primary', 'weparlay'),
            'menu-2' => esc_html__('Footer', 'weparlay'),
        )
    );

    /*
     * Switch default core markup for search form, comment form, and comments
     * to output valid HTML5.
     */
    add_theme_support(
        'html5',
        array(
            'search-form',
            'comment-form',
            'comment-list',
            'gallery',
            'caption',
            'style',
            'script',
        )
    );

    // Set up the WordPress core custom background feature.
    add_theme_support(
        'custom-background',
        apply_filters(
            'weparlay_custom_background_args',
            array(
                'default-color' => 'ffffff',
                'default-image' => '',
            )
        )
    );

    // Add theme support for selective refresh for widgets.
    add_theme_support('customize-selective-refresh-widgets');

    /**
     * Add support for core custom logo.
     *
     * @link https://codex.wordpress.org/Theme_Logo
     */
    add_theme_support(
        'custom-logo',
        array(
            'height'      => 250,
            'width'       => 250,
            'flex-width'  => true,
            'flex-height' => true,
        )
    );
}
add_action('after_setup_theme', 'weparlay_setup');

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *
 * @global int $content_width
 */
function weparlay_content_width() {
    $GLOBALS['content_width'] = apply_filters('weparlay_content_width', 1200);
}
add_action('after_setup_theme', 'weparlay_content_width', 0);

/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */
function weparlay_widgets_init() {
    register_sidebar(
        array(
            'name'          => esc_html__('Sidebar', 'weparlay'),
            'id'            => 'sidebar-1',
            'description'   => esc_html__('Add widgets here.', 'weparlay'),
            'before_widget' => '<section id="%1$s" class="widget %2$s">',
            'after_widget'  => '</section>',
            'before_title'  => '<h2 class="widget-title">',
            'after_title'   => '</h2>',
        )
    );
    
    // Register footer widget areas
    register_sidebar(
        array(
            'name'          => esc_html__('Footer 1', 'weparlay'),
            'id'            => 'footer-1',
            'description'   => esc_html__('Add widgets here.', 'weparlay'),
            'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
            'after_widget'  => '</div>',
            'before_title'  => '<h3 class="footer-widget-title">',
            'after_title'   => '</h3>',
        )
    );
    
    register_sidebar(
        array(
            'name'          => esc_html__('Footer 2', 'weparlay'),
            'id'            => 'footer-2',
            'description'   => esc_html__('Add widgets here.', 'weparlay'),
            'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
            'after_widget'  => '</div>',
            'before_title'  => '<h3 class="footer-widget-title">',
            'after_title'   => '</h3>',
        )
    );
    
    register_sidebar(
        array(
            'name'          => esc_html__('Footer 3', 'weparlay'),
            'id'            => 'footer-3',
            'description'   => esc_html__('Add widgets here.', 'weparlay'),
            'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
            'after_widget'  => '</div>',
            'before_title'  => '<h3 class="footer-widget-title">',
            'after_title'   => '</h3>',
        )
    );
}
add_action('widgets_init', 'weparlay_widgets_init');

/**
 * Enqueue scripts and styles.
 */
function weparlay_scripts() {
    wp_enqueue_style('weparlay-style', get_stylesheet_uri(), array(), WEPARLAY_VERSION);
    
    // Add Google Fonts if needed
    wp_enqueue_style('weparlay-google-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', array(), null);
    
    // Add Font Awesome for icons
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', array(), '6.4.0');
    
    // Main JS file
    wp_enqueue_script('weparlay-main', get_template_directory_uri() . '/js/main.js', array('jquery'), WEPARLAY_VERSION, true);
    
    // Only load betting functionality on betting pages
    if (is_page_template('template-betting.php') || is_page_template('template-odds.php') || is_page_template('template-live-betting.php')) {
        wp_enqueue_script('weparlay-betting', get_template_directory_uri() . '/js/betting.js', array('jquery'), WEPARLAY_VERSION, true);
    }
    
    // Only load app integration on app template
    if (is_page_template('template-app.php')) {
        wp_enqueue_script('weparlay-app-integration', get_template_directory_uri() . '/js/app-integration.js', array('jquery'), WEPARLAY_VERSION, true);
        
        // Pass the app URL to the script
        wp_localize_script('weparlay-app-integration', 'weparlayApp', array(
            'appUrl' => get_theme_mod('weparlay_app_url', 'https://your-app-name.replit.app')
        ));
    }
    
    if (is_singular() && comments_open() && get_option('thread_comments')) {
        wp_enqueue_script('comment-reply');
    }
}
add_action('wp_enqueue_scripts', 'weparlay_scripts');

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/inc/template-tags.php';

/**
 * Functions which enhance the theme by hooking into WordPress.
 */
require get_template_directory() . '/inc/template-functions.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/inc/customizer.php';

/**
 * Register Custom Post Types
 */
function weparlay_register_post_types() {
    // Register Sports Custom Post Type
    register_post_type('sport', array(
        'labels' => array(
            'name' => _x('Sports', 'post type general name', 'weparlay'),
            'singular_name' => _x('Sport', 'post type singular name', 'weparlay'),
            'menu_name' => _x('Sports', 'admin menu', 'weparlay'),
            'name_admin_bar' => _x('Sport', 'add new on admin bar', 'weparlay'),
            'add_new' => _x('Add New', 'sport', 'weparlay'),
            'add_new_item' => __('Add New Sport', 'weparlay'),
            'new_item' => __('New Sport', 'weparlay'),
            'edit_item' => __('Edit Sport', 'weparlay'),
            'view_item' => __('View Sport', 'weparlay'),
            'all_items' => __('All Sports', 'weparlay'),
            'search_items' => __('Search Sports', 'weparlay'),
            'parent_item_colon' => __('Parent Sports:', 'weparlay'),
            'not_found' => __('No sports found.', 'weparlay'),
            'not_found_in_trash' => __('No sports found in Trash.', 'weparlay')
        ),
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'menu_icon' => 'dashicons-awards',
        'rewrite' => array('slug' => 'sports'),
    ));
    
    // Register Events Custom Post Type
    register_post_type('event', array(
        'labels' => array(
            'name' => _x('Events', 'post type general name', 'weparlay'),
            'singular_name' => _x('Event', 'post type singular name', 'weparlay'),
            'menu_name' => _x('Events', 'admin menu', 'weparlay'),
            'name_admin_bar' => _x('Event', 'add new on admin bar', 'weparlay'),
            'add_new' => _x('Add New', 'event', 'weparlay'),
            'add_new_item' => __('Add New Event', 'weparlay'),
            'new_item' => __('New Event', 'weparlay'),
            'edit_item' => __('Edit Event', 'weparlay'),
            'view_item' => __('View Event', 'weparlay'),
            'all_items' => __('All Events', 'weparlay'),
            'search_items' => __('Search Events', 'weparlay'),
            'parent_item_colon' => __('Parent Events:', 'weparlay'),
            'not_found' => __('No events found.', 'weparlay'),
            'not_found_in_trash' => __('No events found in Trash.', 'weparlay')
        ),
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'menu_icon' => 'dashicons-calendar-alt',
        'rewrite' => array('slug' => 'events'),
    ));
    
    // Register Teams Custom Post Type
    register_post_type('team', array(
        'labels' => array(
            'name' => _x('Teams', 'post type general name', 'weparlay'),
            'singular_name' => _x('Team', 'post type singular name', 'weparlay'),
            'menu_name' => _x('Teams', 'admin menu', 'weparlay'),
            'name_admin_bar' => _x('Team', 'add new on admin bar', 'weparlay'),
            'add_new' => _x('Add New', 'team', 'weparlay'),
            'add_new_item' => __('Add New Team', 'weparlay'),
            'new_item' => __('New Team', 'weparlay'),
            'edit_item' => __('Edit Team', 'weparlay'),
            'view_item' => __('View Team', 'weparlay'),
            'all_items' => __('All Teams', 'weparlay'),
            'search_items' => __('Search Teams', 'weparlay'),
            'parent_item_colon' => __('Parent Teams:', 'weparlay'),
            'not_found' => __('No teams found.', 'weparlay'),
            'not_found_in_trash' => __('No teams found in Trash.', 'weparlay')
        ),
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'menu_icon' => 'dashicons-groups',
        'rewrite' => array('slug' => 'teams'),
    ));
}
add_action('init', 'weparlay_register_post_types');

/**
 * Register Custom Taxonomies
 */
function weparlay_register_taxonomies() {
    // Sport Categories Taxonomy
    register_taxonomy('sport-category', 'sport', array(
        'labels' => array(
            'name' => _x('Sport Categories', 'taxonomy general name', 'weparlay'),
            'singular_name' => _x('Sport Category', 'taxonomy singular name', 'weparlay'),
            'search_items' => __('Search Sport Categories', 'weparlay'),
            'all_items' => __('All Sport Categories', 'weparlay'),
            'parent_item' => __('Parent Sport Category', 'weparlay'),
            'parent_item_colon' => __('Parent Sport Category:', 'weparlay'),
            'edit_item' => __('Edit Sport Category', 'weparlay'),
            'update_item' => __('Update Sport Category', 'weparlay'),
            'add_new_item' => __('Add New Sport Category', 'weparlay'),
            'new_item_name' => __('New Sport Category Name', 'weparlay'),
            'menu_name' => __('Sport Categories', 'weparlay'),
        ),
        'hierarchical' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'sport-category'),
        'show_in_rest' => true,
    ));
    
    // Event Types Taxonomy
    register_taxonomy('event-type', 'event', array(
        'labels' => array(
            'name' => _x('Event Types', 'taxonomy general name', 'weparlay'),
            'singular_name' => _x('Event Type', 'taxonomy singular name', 'weparlay'),
            'search_items' => __('Search Event Types', 'weparlay'),
            'all_items' => __('All Event Types', 'weparlay'),
            'parent_item' => __('Parent Event Type', 'weparlay'),
            'parent_item_colon' => __('Parent Event Type:', 'weparlay'),
            'edit_item' => __('Edit Event Type', 'weparlay'),
            'update_item' => __('Update Event Type', 'weparlay'),
            'add_new_item' => __('Add New Event Type', 'weparlay'),
            'new_item_name' => __('New Event Type Name', 'weparlay'),
            'menu_name' => __('Event Types', 'weparlay'),
        ),
        'hierarchical' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'event-type'),
        'show_in_rest' => true,
    ));
    
    // Team Leagues Taxonomy
    register_taxonomy('league', 'team', array(
        'labels' => array(
            'name' => _x('Leagues', 'taxonomy general name', 'weparlay'),
            'singular_name' => _x('League', 'taxonomy singular name', 'weparlay'),
            'search_items' => __('Search Leagues', 'weparlay'),
            'all_items' => __('All Leagues', 'weparlay'),
            'parent_item' => __('Parent League', 'weparlay'),
            'parent_item_colon' => __('Parent League:', 'weparlay'),
            'edit_item' => __('Edit League', 'weparlay'),
            'update_item' => __('Update League', 'weparlay'),
            'add_new_item' => __('Add New League', 'weparlay'),
            'new_item_name' => __('New League Name', 'weparlay'),
            'menu_name' => __('Leagues', 'weparlay'),
        ),
        'hierarchical' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'league'),
        'show_in_rest' => true,
    ));
}
add_action('init', 'weparlay_register_taxonomies');

/**
 * Add App Template
 */
function weparlay_add_app_template($templates) {
    $templates['template-app.php'] = 'App Template';
    return $templates;
}
add_filter('theme_page_templates', 'weparlay_add_app_template');

/**
 * Add settings to the Customizer.
 *
 * @param WP_Customize_Manager $wp_customize Theme Customizer object.
 */
function weparlay_customize_register($wp_customize) {
    // Add App Integration Section
    $wp_customize->add_section('weparlay_app_integration', array(
        'title'    => __('App Integration', 'weparlay'),
        'priority' => 130,
    ));
    
    // Add App URL Setting
    $wp_customize->add_setting('weparlay_app_url', array(
        'default'           => 'https://your-app-name.replit.app',
        'sanitize_callback' => 'esc_url_raw',
    ));
    
    $wp_customize->add_control('weparlay_app_url', array(
        'label'    => __('App URL', 'weparlay'),
        'section'  => 'weparlay_app_integration',
        'type'     => 'url',
        'description' => __('Enter the URL of your WeParlay App (from Replit)', 'weparlay'),
    ));
    
    // Add Show Header Setting
    $wp_customize->add_setting('weparlay_show_header', array(
        'default'           => true,
        'sanitize_callback' => 'weparlay_sanitize_checkbox',
    ));
    
    $wp_customize->add_control('weparlay_show_header', array(
        'label'    => __('Show Header on App Pages', 'weparlay'),
        'section'  => 'weparlay_app_integration',
        'type'     => 'checkbox',
    ));
    
    // Add Show Footer Setting
    $wp_customize->add_setting('weparlay_show_footer', array(
        'default'           => true,
        'sanitize_callback' => 'weparlay_sanitize_checkbox',
    ));
    
    $wp_customize->add_control('weparlay_show_footer', array(
        'label'    => __('Show Footer on App Pages', 'weparlay'),
        'section'  => 'weparlay_app_integration',
        'type'     => 'checkbox',
    ));
    
    // Add Theme Colors
    $wp_customize->add_setting('weparlay_primary_color', array(
        'default'           => '#3498db',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'weparlay_primary_color', array(
        'label'    => __('Primary Color', 'weparlay'),
        'section'  => 'colors',
        'settings' => 'weparlay_primary_color',
    )));
    
    $wp_customize->add_setting('weparlay_secondary_color', array(
        'default'           => '#2c3e50',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'weparlay_secondary_color', array(
        'label'    => __('Secondary Color', 'weparlay'),
        'section'  => 'colors',
        'settings' => 'weparlay_secondary_color',
    )));
}
add_action('customize_register', 'weparlay_customize_register');

/**
 * Sanitize checkbox for Customizer.
 *
 * @param bool $checked Whether the checkbox is checked.
 * @return bool Whether the checkbox is checked.
 */
function weparlay_sanitize_checkbox($checked) {
    return (isset($checked) && true === $checked) ? true : false;
}

/**
 * Output custom CSS for theme customizations
 */
function weparlay_customizer_css() {
    $primary_color = get_theme_mod('weparlay_primary_color', '#3498db');
    $secondary_color = get_theme_mod('weparlay_secondary_color', '#2c3e50');
    
    ?>
    <style type="text/css">
        :root {
            --weparlay-primary: <?php echo esc_attr($primary_color); ?>;
            --weparlay-secondary: <?php echo esc_attr($secondary_color); ?>;
        }
    </style>
    <?php
}
add_action('wp_head', 'weparlay_customizer_css');

/**
 * Create necessary directories and files if they don't exist
 */
function weparlay_create_theme_files() {
    $theme_dir = get_template_directory();
    
    // Create directories
    $directories = array(
        '/inc',
        '/js',
        '/languages',
    );
    
    foreach ($directories as $dir) {
        if (!file_exists($theme_dir . $dir)) {
            wp_mkdir_p($theme_dir . $dir);
        }
    }
    
    // Create template-tags.php if it doesn't exist
    if (!file_exists($theme_dir . '/inc/template-tags.php')) {
        $template_tags_content = <<<EOT
<?php
/**
 * Custom template tags for this theme
 *
 * @package WeParlay
 */

if (!function_exists('weparlay_posted_on')) :
    /**
     * Prints HTML with meta information for the current post-date/time.
     */
    function weparlay_posted_on() {
        \$time_string = '<time class="entry-date published updated" datetime="%1\$s">%2\$s</time>';
        if (get_the_time('U') !== get_the_modified_time('U')) {
            \$time_string = '<time class="entry-date published" datetime="%1\$s">%2\$s</time><time class="updated" datetime="%3\$s">%4\$s</time>';
        }

        \$time_string = sprintf(
            \$time_string,
            esc_attr(get_the_date(DATE_W3C)),
            esc_html(get_the_date()),
            esc_attr(get_the_modified_date(DATE_W3C)),
            esc_html(get_the_modified_date())
        );

        \$posted_on = sprintf(
            /* translators: %s: post date. */
            esc_html_x('Posted on %s', 'post date', 'weparlay'),
            '<a href="' . esc_url(get_permalink()) . '" rel="bookmark">' . \$time_string . '</a>'
        );

        echo '<span class="posted-on">' . \$posted_on . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }
endif;

if (!function_exists('weparlay_posted_by')) :
    /**
     * Prints HTML with meta information for the current author.
     */
    function weparlay_posted_by() {
        \$byline = sprintf(
            /* translators: %s: post author. */
            esc_html_x('by %s', 'post author', 'weparlay'),
            '<span class="author vcard"><a class="url fn n" href="' . esc_url(get_author_posts_url(get_the_author_meta('ID'))) . '">' . esc_html(get_the_author()) . '</a></span>'
        );

        echo '<span class="byline"> ' . \$byline . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }
endif;
EOT;

        file_put_contents($theme_dir . '/inc/template-tags.php', $template_tags_content);
    }
    
    // Create template-functions.php if it doesn't exist
    if (!file_exists($theme_dir . '/inc/template-functions.php')) {
        $template_functions_content = <<<EOT
<?php
/**
 * Functions which enhance the theme by hooking into WordPress
 *
 * @package WeParlay
 */

/**
 * Adds custom classes to the array of body classes.
 *
 * @param array \$classes Classes for the body element.
 * @return array
 */
function weparlay_body_classes(\$classes) {
    // Adds a class of hfeed to non-singular pages.
    if (!is_singular()) {
        \$classes[] = 'hfeed';
    }

    // Adds a class of no-sidebar when there is no sidebar present.
    if (!is_active_sidebar('sidebar-1')) {
        \$classes[] = 'no-sidebar';
    }

    return \$classes;
}
add_filter('body_class', 'weparlay_body_classes');

/**
 * Add a pingback url auto-discovery header for single posts, pages, or attachments.
 */
function weparlay_pingback_header() {
    if (is_singular() && pings_open()) {
        printf('<link rel="pingback" href="%s">', esc_url(get_bloginfo('pingback_url')));
    }
}
add_action('wp_head', 'weparlay_pingback_header');
EOT;

        file_put_contents($theme_dir . '/inc/template-functions.php', $template_functions_content);
    }
    
    // Create customizer.php if it doesn't exist
    if (!file_exists($theme_dir . '/inc/customizer.php')) {
        $customizer_content = <<<EOT
<?php
/**
 * WeParlay Theme Customizer
 *
 * @package WeParlay
 */

/**
 * Add postMessage support for site title and description for the Theme Customizer.
 *
 * @param WP_Customize_Manager \$wp_customize Theme Customizer object.
 */
function weparlay_customize_register(\$wp_customize) {
    \$wp_customize->get_setting('blogname')->transport         = 'postMessage';
    \$wp_customize->get_setting('blogdescription')->transport  = 'postMessage';
    \$wp_customize->get_setting('header_textcolor')->transport = 'postMessage';

    if (isset(\$wp_customize->selective_refresh)) {
        \$wp_customize->selective_refresh->add_partial(
            'blogname',
            array(
                'selector'        => '.site-title a',
                'render_callback' => 'weparlay_customize_partial_blogname',
            )
        );
        \$wp_customize->selective_refresh->add_partial(
            'blogdescription',
            array(
                'selector'        => '.site-description',
                'render_callback' => 'weparlay_customize_partial_blogdescription',
            )
        );
    }
}
add_action('customize_register', 'weparlay_customize_register');

/**
 * Render the site title for the selective refresh partial.
 *
 * @return void
 */
function weparlay_customize_partial_blogname() {
    bloginfo('name');
}

/**
 * Render the site tagline for the selective refresh partial.
 *
 * @return void
 */
function weparlay_customize_partial_blogdescription() {
    bloginfo('description');
}

/**
 * Binds JS handlers to make Theme Customizer preview reload changes asynchronously.
 */
function weparlay_customize_preview_js() {
    wp_enqueue_script('weparlay-customizer', get_template_directory_uri() . '/js/customizer.js', array('customize-preview'), WEPARLAY_VERSION, true);
}
add_action('customize_preview_init', 'weparlay_customize_preview_js');
EOT;

        file_put_contents($theme_dir . '/inc/customizer.php', $customizer_content);
    }
    
    // Create main.js if it doesn't exist
    if (!file_exists($theme_dir . '/js/main.js')) {
        $main_js_content = <<<EOT
/**
 * Main JavaScript for WeParlay Theme
 */
(function($) {
    'use strict';
    
    // Mobile menu toggle
    $('.menu-toggle').on('click', function() {
        $('.main-navigation ul').toggleClass('show');
    });
    
    // Responsive behavior
    $(window).on('resize', function() {
        if ($(window).width() > 768) {
            $('.main-navigation ul').removeClass('show');
        }
    });
    
})(jQuery);
EOT;

        file_put_contents($theme_dir . '/js/main.js', $main_js_content);
    }
    
    // Create app-integration.js if it doesn't exist
    if (!file_exists($theme_dir . '/js/app-integration.js')) {
        $app_js_content = <<<EOT
/**
 * App Integration JavaScript for WeParlay Theme
 */
(function($) {
    'use strict';
    
    $(document).ready(function() {
        var iframe = document.getElementById('weparlay-app-iframe');
        
        if (iframe) {
            // Send theme colors to the app iframe
            function sendThemeColors() {
                var colors = {
                    primary: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-primary').trim(),
                    secondary: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-secondary').trim(),
                    background: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-background').trim(),
                    text: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-text').trim()
                };
                
                iframe.contentWindow.postMessage({
                    action: 'theme',
                    colors: colors
                }, weparlayApp.appUrl);
            }
            
            // Send theme colors when iframe loads
            iframe.addEventListener('load', function() {
                // Wait a moment for the iframe to fully initialize
                setTimeout(sendThemeColors, 1000);
                
                // Handle iframe height adjustments
                adjustIframeHeight();
            });
            
            // Handle messages from the iframe
            window.addEventListener('message', function(event) {
                // Only accept messages from the app URL
                if (event.origin !== weparlayApp.appUrl) {
                    return;
                }
                
                var data = event.data;
                
                // Handle resize requests
                if (data && data.action === 'resize') {
                    iframe.style.height = data.height + 'px';
                }
                
                // Handle navigation requests
                if (data && data.action === 'navigate') {
                    window.location.href = data.url;
                }
            });
            
            // Adjust iframe height to content
            function adjustIframeHeight() {
                try {
                    var height = Math.max(
                        800,
                        iframe.contentWindow.document.body.scrollHeight,
                        iframe.contentWindow.document.documentElement.scrollHeight
                    );
                    
                    iframe.style.height = height + 'px';
                } catch(e) {
                    console.log('Could not adjust iframe height: ', e);
                }
            }
        }
    });
    
})(jQuery);
EOT;

        file_put_contents($theme_dir . '/js/app-integration.js', $app_js_content);
    }
    
    // Create betting.js if it doesn't exist
    if (!file_exists($theme_dir . '/js/betting.js')) {
        $betting_js_content = <<<EOT
/**
 * Betting functionality JavaScript for WeParlay Theme
 */
(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Handle odds selection
        $('.odds-box').on('click', function() {
            $(this).toggleClass('selected');
            updateBettingSlip();
        });
        
        // Update the betting slip
        function updateBettingSlip() {
            var selectedOdds = $('.odds-box.selected');
            var slipItems = $('.slip-items');
            
            // Clear the slip
            slipItems.empty();
            
            if (selectedOdds.length === 0) {
                slipItems.append('<div class="text-center p-4">No selections yet</div>');
                return;
            }
            
            // Add each selection to the slip
            selectedOdds.each(function() {
                var game = $(this).closest('.game-card');
                var gameTitle = game.find('.game-header h4').text();
                var teams = game.find('.team-name');
                var homeTeam = $(teams[0]).text();
                var awayTeam = $(teams[1]).text();
                var oddsType = $(this).find('.odds-type').text();
                var oddsValue = $(this).find('.odds-value').text();
                
                var slipItem = $(
                    '<div class="slip-item">' +
                    '  <div class="slip-item-header">' +
                    '    <div class="slip-item-title">' + gameTitle + '</div>' +
                    '    <div class="slip-item-remove"><i class="fas fa-times"></i></div>' +
                    '  </div>' +
                    '  <div class="slip-item-details">' +
                    '    <div>' + homeTeam + ' vs ' + awayTeam + '</div>' +
                    '    <div>' + oddsType + ': ' + oddsValue + '</div>' +
                    '  </div>' +
                    '</div>'
                );
                
                slipItems.append(slipItem);
                
                // Handle remove button
                slipItem.find('.slip-item-remove').on('click', function() {
                    $(this).closest('.slip-item').remove();
                    $(this).closest('.game-card').find('.odds-box').removeClass('selected');
                    updateBettingSlip();
                });
            });
            
            // Update potential winnings based on stake
            updatePotentialWinnings();
        }
        
        // Update potential winnings
        function updatePotentialWinnings() {
            var stake = parseFloat($('#stake-amount').val()) || 0;
            var totalOdds = 1;
            
            $('.odds-box.selected').each(function() {
                var oddsValue = $(this).find('.odds-value').text();
                var decimalOdds = parseFloat(oddsValue);
                
                if (!isNaN(decimalOdds)) {
                    totalOdds *= decimalOdds;
                }
            });
            
            var potentialWinnings = stake * totalOdds;
            $('.potential-winnings-value').text('$' + potentialWinnings.toFixed(2));
        }
        
        // Handle stake input changes
        $('#stake-amount').on('input', function() {
            updatePotentialWinnings();
        });
        
        // Initialize betting slip
        updateBettingSlip();
        
        // Odds comparison tabs
        $('.odds-comparison-tab').on('click', function() {
            $('.odds-comparison-tab').removeClass('active');
            $(this).addClass('active');
            
            var tabId = $(this).data('tab');
            $('.odds-comparison-tab-content').hide();
            $('#' + tabId).show();
        });
        
        // Initialize first odds comparison tab as active
        $('.odds-comparison-tab:first').click();
    });
    
})(jQuery);
EOT;

        file_put_contents($theme_dir . '/js/betting.js', $betting_js_content);
    }
}
add_action('after_switch_theme', 'weparlay_create_theme_files');