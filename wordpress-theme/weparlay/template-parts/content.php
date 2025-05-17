<?php
/**
 * Template part for displaying posts
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package WeParlay
 */

?>

<article id="post-<?php the_ID(); ?>" <?php post_class('card'); ?>>
	<header class="card-header entry-header">
		<?php
		if ( is_singular() ) :
			the_title( '<h1 class="card-title entry-title">', '</h1>' );
		else :
			the_title( '<h2 class="card-title entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' );
		endif;

		if ( 'post' === get_post_type() ) :
			?>
			<div class="entry-meta">
				<?php
				weparlay_posted_on();
				weparlay_posted_by();
				?>
			</div><!-- .entry-meta -->
		<?php endif; ?>
	</header><!-- .entry-header -->

	<?php if ( has_post_thumbnail() && !is_singular() ) : ?>
		<div class="post-thumbnail">
			<a href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
				<?php the_post_thumbnail('medium', array('class' => 'card-img-top')); ?>
			</a>
		</div>
	<?php endif; ?>

	<div class="card-content entry-content">
		<?php
		if ( is_singular() ) :
			if ( has_post_thumbnail() ) :
				the_post_thumbnail('large', array('class' => 'img-fluid mb-4'));
			endif;
			
			the_content(
				sprintf(
					wp_kses(
						/* translators: %s: Name of current post. Only visible to screen readers */
						__( 'Continue reading<span class="screen-reader-text"> "%s"</span>', 'weparlay' ),
						array(
							'span' => array(
								'class' => array(),
							),
						)
					),
					wp_kses_post( get_the_title() )
				)
			);

			wp_link_pages(
				array(
					'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'weparlay' ),
					'after'  => '</div>',
				)
			);
		else :
			the_excerpt();
			?>
			<a href="<?php the_permalink(); ?>" class="btn"><?php esc_html_e('Read More', 'weparlay'); ?> &raquo;</a>
		<?php endif; ?>
	</div><!-- .entry-content -->

	<?php if ( is_singular() ) : ?>
		<footer class="entry-footer">
			<?php weparlay_entry_footer(); ?>
		</footer><!-- .entry-footer -->
	<?php endif; ?>
</article><!-- #post-<?php the_ID(); ?> -->