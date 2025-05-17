<?php
/**
 * WordPress optimization functions for WeParlay Theme
 * 
 * Fixes for common WordPress warnings and performance issues
 */

/**
 * Add proper crossorigin attribute to preloaded font resources
 */
function weparlay_resource_hints($urls, $relation_type) {
    if ('preload' === $relation_type) {
        foreach ($urls as $key => $url) {
            // If it's a Google Fonts URL
            if (strpos($url, 'fonts.googleapis.com') !== false || strpos($url, 'fonts.gstatic.com') !== false) {
                // Make sure it has the crossorigin attribute
                if (!isset($urls[$key]['crossorigin'])) {
                    $urls[$key]['crossorigin'] = '';
                }
            }
        }
    }
    
    return $urls;
}
add_filter('wp_resource_hints', 'weparlay_resource_hints', 10, 2);

/**
 * Properly enqueue Google Fonts with crossorigin attribute
 */
function weparlay_enqueue_google_fonts() {
    // Remove any existing Google Fonts registrations that might not have crossorigin
    wp_dequeue_style('google-fonts');
    wp_dequeue_style('weparlay-google-fonts');
    
    // Add proper Google Fonts with crossorigin
    wp_enqueue_style(
        'weparlay-google-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        array(),
        null
    );
    
    // Add proper preconnect links
    add_filter('wp_resource_hints', function($urls, $relation_type) {
        if ('preconnect' === $relation_type) {
            $urls[] = array(
                'href' => 'https://fonts.googleapis.com',
                'crossorigin' => ''
            );
            $urls[] = array(
                'href' => 'https://fonts.gstatic.com',
                'crossorigin' => ''
            );
        }
        return $urls;
    }, 10, 2);
}
add_action('wp_enqueue_scripts', 'weparlay_enqueue_google_fonts', 1);