<?php
/**
 * The main template file
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package WeParlay
 */

// Simple theme testing - this will output at the very least
if (!function_exists('get_header')) {
    echo '<h1>WeParlay Theme Basic Check</h1>';
    echo '<p>It appears WordPress functions are not available. This may indicate an installation issue.</p>';
    exit;
}

// Add header
get_header();
?>

<main id="primary" class="site-main">
    <div class="container">
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; background: #f9f9f9;">
            <h2>WeParlay Theme is Active!</h2>
            <p>If you're seeing this message, the theme is installed correctly but you may need to:</p>
            <ol>
                <li>Create pages using the custom page templates</li>
                <li>Configure the theme options in Appearance > Customize</li>
                <li>Set up your App Integration URL in the theme settings</li>
            </ol>
        </div>
        
        <?php
        if (have_posts()) :
            if (is_home() && !is_front_page()) :
                ?>
                <header>
                    <h1 class="page-title screen-reader-text"><?php single_post_title(); ?></h1>
                </header>
                <?php
            endif;

            /* Start the Loop */
            while (have_posts()) :
                the_post();
                
                // Simple fallback content display if template parts aren't loading
                if (file_exists(get_template_directory() . '/template-parts/content.php')) {
                    get_template_part('template-parts/content', get_post_type());
                } else {
                    // Fallback content display
                    ?>
                    <article id="post-<?php the_ID(); ?>" <?php post_class('card'); ?>>
                        <header class="card-header">
                            <?php the_title('<h2 class="entry-title">', '</h2>'); ?>
                        </header>
                        
                        <div class="card-content">
                            <?php the_content(); ?>
                        </div>
                    </article>
                    <?php
                }
            endwhile;

            the_posts_navigation();

        else :
            if (file_exists(get_template_directory() . '/template-parts/content-none.php')) {
                get_template_part('template-parts/content', 'none');
            } else {
                // Fallback no content message
                ?>
                <section class="no-results">
                    <header class="page-header">
                        <h1 class="page-title">Nothing Found</h1>
                    </header>
                    <div class="page-content">
                        <p>It seems we can't find what you're looking for.</p>
                    </div>
                </section>
                <?php
            }
        endif;
        ?>
    </div>
</main><!-- #main -->

<?php
// Check if sidebar exists
if (function_exists('get_sidebar')) {
    get_sidebar();
}

// Add footer
if (function_exists('get_footer')) {
    get_footer();
}