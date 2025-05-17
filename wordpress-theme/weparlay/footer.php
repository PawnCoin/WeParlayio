<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package WeParlay
 */

// Only display footer if not on app template or if show_footer is enabled
$hide_footer = is_page_template('template-app.php') && !get_theme_mod('weparlay_show_footer', true);

if (!$hide_footer) :
?>

	<footer id="colophon" class="site-footer">
		<div class="container">
			<div class="footer-widgets">
				<div class="footer-widget-column">
					<?php if (is_active_sidebar('footer-1')) : ?>
						<?php dynamic_sidebar('footer-1'); ?>
					<?php else : ?>
						<div class="footer-widget">
							<h3 class="footer-widget-title"><?php echo esc_html(get_bloginfo('name')); ?></h3>
							<p><?php echo esc_html(get_bloginfo('description')); ?></p>
						</div>
					<?php endif; ?>
				</div>
				
				<div class="footer-widget-column">
					<?php if (is_active_sidebar('footer-2')) : ?>
						<?php dynamic_sidebar('footer-2'); ?>
					<?php else : ?>
						<div class="footer-widget">
							<h3 class="footer-widget-title"><?php esc_html_e('Quick Links', 'weparlay'); ?></h3>
							<ul>
								<li><a href="<?php echo esc_url(home_url('/')); ?>"><?php esc_html_e('Home', 'weparlay'); ?></a></li>
								<li><a href="<?php echo esc_url(home_url('/about')); ?>"><?php esc_html_e('About', 'weparlay'); ?></a></li>
								<li><a href="<?php echo esc_url(home_url('/contact')); ?>"><?php esc_html_e('Contact', 'weparlay'); ?></a></li>
								<li><a href="<?php echo esc_url(home_url('/privacy-policy')); ?>"><?php esc_html_e('Privacy Policy', 'weparlay'); ?></a></li>
								<li><a href="<?php echo esc_url(home_url('/terms-of-service')); ?>"><?php esc_html_e('Terms of Service', 'weparlay'); ?></a></li>
							</ul>
						</div>
					<?php endif; ?>
				</div>
				
				<div class="footer-widget-column">
					<?php if (is_active_sidebar('footer-3')) : ?>
						<?php dynamic_sidebar('footer-3'); ?>
					<?php else : ?>
						<div class="footer-widget">
							<h3 class="footer-widget-title"><?php esc_html_e('Connect With Us', 'weparlay'); ?></h3>
							<div class="social-icons">
								<a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
								<a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
								<a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
								<a href="#" class="social-icon"><i class="fab fa-youtube"></i></a>
							</div>
							<p><?php esc_html_e('Follow us on social media for updates and promotions.', 'weparlay'); ?></p>
						</div>
					<?php endif; ?>
				</div>
			</div>
			
			<div class="footer-bottom">
				<div class="copyright">
					<?php
					/* translators: %1$s: current year, %2$s: site name */
					printf(esc_html__('&copy; %1$s %2$s. All Rights Reserved.', 'weparlay'), date_i18n('Y'), get_bloginfo('name'));
					?>
				</div>
				
				<div class="legal-links">
					<a href="<?php echo esc_url(home_url('/responsible-gambling')); ?>"><?php esc_html_e('Responsible Gambling', 'weparlay'); ?></a>
					<a href="<?php echo esc_url(home_url('/privacy-policy')); ?>"><?php esc_html_e('Privacy Policy', 'weparlay'); ?></a>
					<a href="<?php echo esc_url(home_url('/terms-of-service')); ?>"><?php esc_html_e('Terms of Service', 'weparlay'); ?></a>
				</div>
			</div>
		</div>
	</footer><!-- #colophon -->
<?php endif; ?>
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>