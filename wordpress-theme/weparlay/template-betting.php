<?php
/**
 * Template Name: Betting Page
 *
 * This template displays the betting interface with sports odds and selections
 *
 * @package WeParlay
 */

get_header();
?>

<main id="primary" class="site-main betting-page">
    <div class="container">
        <header class="page-header">
            <h1 class="page-title"><?php the_title(); ?></h1>
            <?php if (get_the_content()) : ?>
                <div class="page-description">
                    <?php the_content(); ?>
                </div>
            <?php endif; ?>
        </header>

        <div class="betting-layout">
            <div class="sports-sidebar">
                <h3 class="sidebar-title">Sports</h3>
                <ul class="sports-list">
                    <li class="sport-item active">
                        <a href="#" class="sport-link">
                            <span class="sport-icon"><i class="fas fa-basketball-ball"></i></span>
                            <span class="sport-name">NBA</span>
                        </a>
                    </li>
                    <li class="sport-item">
                        <a href="#" class="sport-link">
                            <span class="sport-icon"><i class="fas fa-football-ball"></i></span>
                            <span class="sport-name">NFL</span>
                        </a>
                    </li>
                    <li class="sport-item">
                        <a href="#" class="sport-link">
                            <span class="sport-icon"><i class="fas fa-hockey-puck"></i></span>
                            <span class="sport-name">NHL</span>
                        </a>
                    </li>
                    <li class="sport-item">
                        <a href="#" class="sport-link">
                            <span class="sport-icon"><i class="fas fa-baseball-ball"></i></span>
                            <span class="sport-name">MLB</span>
                        </a>
                    </li>
                    <li class="sport-item">
                        <a href="#" class="sport-link">
                            <span class="sport-icon"><i class="fas fa-futbol"></i></span>
                            <span class="sport-name">MLS</span>
                        </a>
                    </li>
                    <li class="sport-item">
                        <a href="#" class="sport-link">
                            <span class="sport-icon"><i class="fas fa-fist-raised"></i></span>
                            <span class="sport-name">UFC</span>
                        </a>
                    </li>
                    <li class="sport-item">
                        <a href="#" class="sport-link">
                            <span class="sport-icon"><i class="fas fa-fist-raised"></i></span>
                            <span class="sport-name">Boxing</span>
                        </a>
                    </li>
                    <li class="sport-item">
                        <a href="#" class="sport-link">
                            <span class="sport-icon"><i class="fas fa-table-tennis"></i></span>
                            <span class="sport-name">Tennis</span>
                        </a>
                    </li>
                    <li class="sport-item">
                        <a href="#" class="sport-link">
                            <span class="sport-icon"><i class="fas fa-flag-checkered"></i></span>
                            <span class="sport-name">NASCAR</span>
                        </a>
                    </li>
                    <li class="sport-item">
                        <a href="#" class="sport-link">
                            <span class="sport-icon"><i class="fas fa-gamepad"></i></span>
                            <span class="sport-name">Video Games</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="betting-content">
                <div class="betting-tabs">
                    <div class="tab-nav">
                        <div class="tab-nav-item active" data-target="tab-upcoming">Upcoming</div>
                        <div class="tab-nav-item" data-target="tab-live">Live Now</div>
                        <div class="tab-nav-item" data-target="tab-popular">Popular</div>
                    </div>
                    
                    <div class="betting-options">
                        <div class="odds-format">
                            <label for="odds-format-toggle">Odds:</label>
                            <select id="odds-format-toggle">
                                <option value="decimal">Decimal</option>
                                <option value="american">American</option>
                                <option value="fractional">Fractional</option>
                            </select>
                        </div>
                        
                        <div class="currency-toggle">
                            <span class="currency-icon"><i class="fas fa-dollar-sign"></i></span>
                            <span class="currency-label">WeParlay Cash</span>
                        </div>
                    </div>
                </div>

                <div class="tab-content active" id="tab-upcoming">
                    <div class="betting-section">
                        <h3 class="section-title">NBA Basketball</h3>
                        
                        <div class="game-card">
                            <div class="game-header">
                                <h4>NBA Basketball</h4>
                                <div class="game-time">Tomorrow, 7:30 PM</div>
                            </div>
                            <div class="game-teams">
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/team-lakers.png'); ?>" alt="Lakers" class="team-logo">
                                    <div class="team-name">Lakers</div>
                                </div>
                                <div class="vs">vs</div>
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/team-celtics.png'); ?>" alt="Celtics" class="team-logo">
                                    <div class="team-name">Celtics</div>
                                </div>
                            </div>
                            <div class="game-odds">
                                <div class="odds-box" data-decimal-odds="1.65">
                                    <div class="odds-type">Lakers to Win</div>
                                    <div class="odds-value">1.65</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="2.25">
                                    <div class="odds-type">Celtics to Win</div>
                                    <div class="odds-value">2.25</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="1.90">
                                    <div class="odds-type">Over 210.5 Points</div>
                                    <div class="odds-value">1.90</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="game-card">
                            <div class="game-header">
                                <h4>NBA Basketball</h4>
                                <div class="game-time">Tomorrow, 8:00 PM</div>
                            </div>
                            <div class="game-teams">
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/team-warriors.png'); ?>" alt="Warriors" class="team-logo">
                                    <div class="team-name">Warriors</div>
                                </div>
                                <div class="vs">vs</div>
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/team-nets.png'); ?>" alt="Nets" class="team-logo">
                                    <div class="team-name">Nets</div>
                                </div>
                            </div>
                            <div class="game-odds">
                                <div class="odds-box" data-decimal-odds="1.55">
                                    <div class="odds-type">Warriors to Win</div>
                                    <div class="odds-value">1.55</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="2.45">
                                    <div class="odds-type">Nets to Win</div>
                                    <div class="odds-value">2.45</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="1.85">
                                    <div class="odds-type">Under 225.5 Points</div>
                                    <div class="odds-value">1.85</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="betting-section">
                        <h3 class="section-title">NFL Football</h3>
                        
                        <div class="game-card">
                            <div class="game-header">
                                <h4>NFL Football</h4>
                                <div class="game-time">Sunday, 1:00 PM</div>
                            </div>
                            <div class="game-teams">
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/team-chiefs.png'); ?>" alt="Chiefs" class="team-logo">
                                    <div class="team-name">Chiefs</div>
                                </div>
                                <div class="vs">vs</div>
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/team-ravens.png'); ?>" alt="Ravens" class="team-logo">
                                    <div class="team-name">Ravens</div>
                                </div>
                            </div>
                            <div class="game-odds">
                                <div class="odds-box" data-decimal-odds="1.50">
                                    <div class="odds-type">Chiefs to Win</div>
                                    <div class="odds-value">1.50</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="2.60">
                                    <div class="odds-type">Ravens to Win</div>
                                    <div class="odds-value">2.60</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="1.85">
                                    <div class="odds-type">Under 45.5 Points</div>
                                    <div class="odds-value">1.85</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-content" id="tab-live" style="display: none;">
                    <div class="betting-section">
                        <h3 class="section-title">Live Games</h3>
                        
                        <div class="game-card">
                            <div class="game-header">
                                <span class="live-badge">LIVE</span>
                                <h4>NBA Basketball</h4>
                            </div>
                            <div class="game-teams">
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/team-lakers.png'); ?>" alt="Lakers" class="team-logo">
                                    <div class="team-name">Lakers</div>
                                    <div class="live-score">102</div>
                                </div>
                                <div class="vs">vs</div>
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/team-celtics.png'); ?>" alt="Celtics" class="team-logo">
                                    <div class="team-name">Celtics</div>
                                    <div class="live-score">98</div>
                                </div>
                            </div>
                            <div class="live-period">4th Quarter - 2:15 remaining</div>
                            <div class="game-odds">
                                <div class="odds-box" data-decimal-odds="1.20">
                                    <div class="odds-type">Lakers to Win</div>
                                    <div class="odds-value">1.20</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="4.50">
                                    <div class="odds-type">Celtics to Win</div>
                                    <div class="odds-value">4.50</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="1.90">
                                    <div class="odds-type">Over 210.5 Points</div>
                                    <div class="odds-value">1.90</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="game-card">
                            <div class="game-header">
                                <span class="live-badge">LIVE</span>
                                <h4>NFL Football</h4>
                            </div>
                            <div class="game-teams">
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/team-chiefs.png'); ?>" alt="Chiefs" class="team-logo">
                                    <div class="team-name">Chiefs</div>
                                    <div class="live-score">21</div>
                                </div>
                                <div class="vs">vs</div>
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/team-ravens.png'); ?>" alt="Ravens" class="team-logo">
                                    <div class="team-name">Ravens</div>
                                    <div class="live-score">17</div>
                                </div>
                            </div>
                            <div class="live-period">3rd Quarter - 8:45 remaining</div>
                            <div class="game-odds">
                                <div class="odds-box" data-decimal-odds="1.35">
                                    <div class="odds-type">Chiefs to Win</div>
                                    <div class="odds-value">1.35</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="3.20">
                                    <div class="odds-type">Ravens to Win</div>
                                    <div class="odds-value">3.20</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="1.85">
                                    <div class="odds-type">Under 45.5 Points</div>
                                    <div class="odds-value">1.85</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-content" id="tab-popular" style="display: none;">
                    <div class="betting-section">
                        <h3 class="section-title">Popular Bets</h3>
                        
                        <div class="game-card">
                            <div class="game-header">
                                <h4>NBA Finals</h4>
                                <div class="game-time">Futures</div>
                            </div>
                            <div class="game-teams">
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/trophy.png'); ?>" alt="Championship" class="team-logo">
                                    <div class="team-name">Championship Winner</div>
                                </div>
                            </div>
                            <div class="game-odds">
                                <div class="odds-box" data-decimal-odds="3.50">
                                    <div class="odds-type">Lakers</div>
                                    <div class="odds-value">3.50</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="4.25">
                                    <div class="odds-type">Celtics</div>
                                    <div class="odds-value">4.25</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="5.00">
                                    <div class="odds-type">Warriors</div>
                                    <div class="odds-value">5.00</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="game-card">
                            <div class="game-header">
                                <h4>NFL Super Bowl</h4>
                                <div class="game-time">Futures</div>
                            </div>
                            <div class="game-teams">
                                <div class="team">
                                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/trophy.png'); ?>" alt="Championship" class="team-logo">
                                    <div class="team-name">Super Bowl Winner</div>
                                </div>
                            </div>
                            <div class="game-odds">
                                <div class="odds-box" data-decimal-odds="3.75">
                                    <div class="odds-type">Chiefs</div>
                                    <div class="odds-value">3.75</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="4.50">
                                    <div class="odds-type">49ers</div>
                                    <div class="odds-value">4.50</div>
                                </div>
                                <div class="odds-box" data-decimal-odds="5.50">
                                    <div class="odds-type">Eagles</div>
                                    <div class="odds-value">5.50</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="betting-sidebar">
                <?php echo do_shortcode('[betting_slip]'); ?>
                
                <div class="crypto-bonus">
                    <h3>5% Odds Boost</h3>
                    <p>Place bets using WePlay Token and receive a 5% odds boost!</p>
                    <button class="btn btn-outline">Connect Wallet</button>
                </div>
                
                <?php echo do_shortcode('[odds_comparison]'); ?>
            </div>
        </div>
    </div>
</main>

<?php
wp_enqueue_script('weparlay-betting', get_template_directory_uri() . '/js/betting.js', array('jquery'), WEPARLAY_VERSION, true);
get_footer();