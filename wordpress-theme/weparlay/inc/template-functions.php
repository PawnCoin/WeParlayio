<?php
/**
 * Functions which enhance the theme by hooking into WordPress
 *
 * @package WeParlay
 */

/**
 * Adds custom classes to the array of body classes.
 *
 * @param array $classes Classes for the body element.
 * @return array
 */
function weparlay_body_classes($classes) {
    // Adds a class of hfeed to non-singular pages.
    if (!is_singular()) {
        $classes[] = 'hfeed';
    }

    // Adds a class of no-sidebar when there is no sidebar present.
    if (!is_active_sidebar('sidebar-1')) {
        $classes[] = 'no-sidebar';
    }

    return $classes;
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

/**
 * Add support for live betting widgets
 */
function weparlay_live_betting_widget($atts) {
    $atts = shortcode_atts(array(
        'title' => 'Live Betting',
        'sport' => 'all',
        'limit' => 5,
    ), $atts, 'live_betting');

    ob_start();
    ?>
    <div class="betting-widget live-betting-widget">
        <div class="betting-widget-header">
            <h3 class="betting-widget-title"><?php echo esc_html($atts['title']); ?></h3>
        </div>
        <div class="betting-widget-content">
            <?php 
            // Here we would normally query events from the database
            // For this example, we'll use static content that matches the app's style
            ?>
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
                    <div class="odds-box">
                        <div class="odds-type">Lakers to Win</div>
                        <div class="odds-value">1.65</div>
                    </div>
                    <div class="odds-box">
                        <div class="odds-type">Celtics to Win</div>
                        <div class="odds-value">2.25</div>
                    </div>
                    <div class="odds-box">
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
                    <div class="odds-box">
                        <div class="odds-type">Chiefs to Win</div>
                        <div class="odds-value">1.50</div>
                    </div>
                    <div class="odds-box">
                        <div class="odds-type">Ravens to Win</div>
                        <div class="odds-value">2.60</div>
                    </div>
                    <div class="odds-box">
                        <div class="odds-type">Under 45.5 Points</div>
                        <div class="odds-value">1.85</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('live_betting', 'weparlay_live_betting_widget');

/**
 * Add support for betting slip widget
 */
function weparlay_betting_slip_widget($atts) {
    $atts = shortcode_atts(array(
        'title' => 'Betting Slip',
    ), $atts, 'betting_slip');

    ob_start();
    ?>
    <div class="betting-slip">
        <div class="slip-header">
            <h3><?php echo esc_html($atts['title']); ?></h3>
        </div>
        <div class="slip-items">
            <div class="text-center p-4">No selections yet</div>
        </div>
        <div class="slip-footer">
            <div class="stake-input">
                <label for="stake-amount">Stake Amount ($):</label>
                <input type="number" id="stake-amount" min="1" step="1" value="10" class="form-control">
            </div>
            <div class="potential-winnings">
                <span>Potential Winnings:</span>
                <span class="potential-winnings-value">$0.00</span>
            </div>
            <button class="btn btn-block">Place Bet</button>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('betting_slip', 'weparlay_betting_slip_widget');

/**
 * Add support for odds comparison widget
 */
function weparlay_odds_comparison_widget($atts) {
    $atts = shortcode_atts(array(
        'title' => 'Odds Comparison',
        'sport' => 'all',
    ), $atts, 'odds_comparison');

    ob_start();
    ?>
    <div class="odds-comparison">
        <div class="odds-comparison-header">
            <h3 class="odds-comparison-title"><?php echo esc_html($atts['title']); ?></h3>
        </div>
        <div class="odds-comparison-tabs">
            <div class="odds-comparison-tab active" data-tab="moneyline-tab">Moneyline</div>
            <div class="odds-comparison-tab" data-tab="spread-tab">Spread</div>
            <div class="odds-comparison-tab" data-tab="total-tab">Total</div>
        </div>
        <div class="odds-comparison-content">
            <div id="moneyline-tab" class="odds-comparison-tab-content">
                <table class="odds-table">
                    <thead>
                        <tr>
                            <th>Game</th>
                            <th>DraftKings</th>
                            <th>FanDuel</th>
                            <th>BetMGM</th>
                            <th>Best Odds</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Lakers to Win</td>
                            <td>-150</td>
                            <td class="best-odds">-145</td>
                            <td>-155</td>
                            <td>FanDuel</td>
                        </tr>
                        <tr>
                            <td>Celtics to Win</td>
                            <td>+125</td>
                            <td>+120</td>
                            <td class="best-odds">+130</td>
                            <td>BetMGM</td>
                        </tr>
                        <tr>
                            <td>Chiefs to Win</td>
                            <td class="best-odds">-180</td>
                            <td>-185</td>
                            <td>-190</td>
                            <td>DraftKings</td>
                        </tr>
                        <tr>
                            <td>Ravens to Win</td>
                            <td>+160</td>
                            <td class="best-odds">+170</td>
                            <td>+165</td>
                            <td>FanDuel</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="spread-tab" class="odds-comparison-tab-content" style="display: none;">
                <table class="odds-table">
                    <thead>
                        <tr>
                            <th>Game</th>
                            <th>DraftKings</th>
                            <th>FanDuel</th>
                            <th>BetMGM</th>
                            <th>Best Odds</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Lakers -4.5</td>
                            <td>-110</td>
                            <td class="best-odds">-105</td>
                            <td>-110</td>
                            <td>FanDuel</td>
                        </tr>
                        <tr>
                            <td>Celtics +4.5</td>
                            <td>-110</td>
                            <td>-115</td>
                            <td class="best-odds">-105</td>
                            <td>BetMGM</td>
                        </tr>
                        <tr>
                            <td>Chiefs -7.5</td>
                            <td class="best-odds">-105</td>
                            <td>-110</td>
                            <td>-110</td>
                            <td>DraftKings</td>
                        </tr>
                        <tr>
                            <td>Ravens +7.5</td>
                            <td>-115</td>
                            <td class="best-odds">-110</td>
                            <td>-115</td>
                            <td>FanDuel</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="total-tab" class="odds-comparison-tab-content" style="display: none;">
                <table class="odds-table">
                    <thead>
                        <tr>
                            <th>Game</th>
                            <th>DraftKings</th>
                            <th>FanDuel</th>
                            <th>BetMGM</th>
                            <th>Best Odds</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Lakers/Celtics Over 210.5</td>
                            <td>-110</td>
                            <td class="best-odds">-105</td>
                            <td>-110</td>
                            <td>FanDuel</td>
                        </tr>
                        <tr>
                            <td>Lakers/Celtics Under 210.5</td>
                            <td>-110</td>
                            <td>-115</td>
                            <td class="best-odds">-105</td>
                            <td>BetMGM</td>
                        </tr>
                        <tr>
                            <td>Chiefs/Ravens Over 45.5</td>
                            <td class="best-odds">-105</td>
                            <td>-110</td>
                            <td>-110</td>
                            <td>DraftKings</td>
                        </tr>
                        <tr>
                            <td>Chiefs/Ravens Under 45.5</td>
                            <td>-115</td>
                            <td class="best-odds">-110</td>
                            <td>-115</td>
                            <td>FanDuel</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('odds_comparison', 'weparlay_odds_comparison_widget');

/**
 * Add support for head-to-head challenge widget
 */
function weparlay_head_to_head_widget($atts) {
    $atts = shortcode_atts(array(
        'title' => 'Head-to-Head Challenge',
    ), $atts, 'head_to_head');

    ob_start();
    ?>
    <div class="challenge-card">
        <div class="challenge-header">
            <h3 class="challenge-title"><?php echo esc_html($atts['title']); ?></h3>
        </div>
        <div class="challenge-content">
            <div class="challenge-vs">
                <div class="challenger">
                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/avatar-1.jpg'); ?>" alt="Challenger 1" class="challenger-avatar">
                    <div class="challenger-name">John Doe</div>
                </div>
                <div class="vs-badge">VS</div>
                <div class="challenger">
                    <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/avatar-2.jpg'); ?>" alt="Challenger 2" class="challenger-avatar">
                    <div class="challenger-name">You</div>
                </div>
            </div>
            <div class="challenge-details">
                <div class="challenge-data">
                    <span class="challenge-data-label">Event:</span>
                    <span class="challenge-data-value">Lakers vs Celtics</span>
                </div>
                <div class="challenge-data">
                    <span class="challenge-data-label">Bet:</span>
                    <span class="challenge-data-value">Lakers to Win</span>
                </div>
                <div class="challenge-data">
                    <span class="challenge-data-label">Stake:</span>
                    <span class="challenge-data-value">$50.00</span>
                </div>
                <div class="challenge-data">
                    <span class="challenge-data-label">Odds:</span>
                    <span class="challenge-data-value">1.65</span>
                </div>
                <div class="challenge-data">
                    <span class="challenge-data-label">Potential Winnings:</span>
                    <span class="challenge-data-value">$82.50</span>
                </div>
            </div>
            <div class="challenge-actions">
                <button class="btn btn-secondary">Decline</button>
                <button class="btn">Accept Challenge</button>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('head_to_head', 'weparlay_head_to_head_widget');