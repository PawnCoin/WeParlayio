<?php
/**
 * REST API endpoints for WeParlay fantasy sports integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class WeParlay_REST_API {
    /**
     * Constructor - register REST routes
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Sports list
        register_rest_route('weparlay/v1', '/sports', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_sports'),
            'permission_callback' => '__return_true',
        ));
        
        // Players list
        register_rest_route('weparlay/v1', '/players', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_players'),
            'permission_callback' => '__return_true',
        ));
        
        // Teams list
        register_rest_route('weparlay/v1', '/teams', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_teams'),
            'permission_callback' => '__return_true',
        ));
        
        // Events list
        register_rest_route('weparlay/v1', '/events', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_events'),
            'permission_callback' => '__return_true',
        ));
        
        // Odds API proxy
        register_rest_route('weparlay/v1', '/odds/(?P<path>.*)', array(
            'methods' => 'GET',
            'callback' => array($this, 'proxy_odds_api'),
            'permission_callback' => '__return_true',
        ));
        
        // Yahoo Authentication
        register_rest_route('weparlay/v1', '/yahoo/auth', array(
            'methods' => 'POST',
            'callback' => array($this, 'authenticate_yahoo'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // Yahoo teams
        register_rest_route('weparlay/v1', '/yahoo/teams', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_yahoo_teams'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // Yahoo team roster
        register_rest_route('weparlay/v1', '/yahoo/teams/(?P<team_id>[a-zA-Z0-9-]+)/roster', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_yahoo_team_roster'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // Fantasy teams - user's created teams
        register_rest_route('weparlay/v1', '/fantasy-teams', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_fantasy_teams'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
        
        // Create fantasy team
        register_rest_route('weparlay/v1', '/fantasy-teams', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_fantasy_team'),
            'permission_callback' => array($this, 'check_user_permission'),
        ));
    }
    
    /**
     * Check if user has permission for authenticated endpoints
     */
    public function check_user_permission() {
        return is_user_logged_in();
    }
    
    /**
     * Get list of sports
     */
    public function get_sports() {
        // Example data - in production, this would come from your database
        $sports = array(
            array(
                'id' => 1,
                'name' => 'Basketball',
                'key' => 'basketball',
                'isActive' => true,
                'icon' => 'basketball',
                'eventCount' => 42
            ),
            array(
                'id' => 2,
                'name' => 'Football',
                'key' => 'football',
                'isActive' => true,
                'icon' => 'football',
                'eventCount' => 16
            ),
            array(
                'id' => 3,
                'name' => 'Baseball',
                'key' => 'baseball',
                'isActive' => true,
                'icon' => 'baseball',
                'eventCount' => 30
            ),
            array(
                'id' => 4,
                'name' => 'Hockey',
                'key' => 'hockey',
                'isActive' => true,
                'icon' => 'hockey',
                'eventCount' => 24
            ),
        );
        
        return rest_ensure_response($sports);
    }
    
    /**
     * Get players list
     */
    public function get_players($request) {
        $sport_id = isset($request['sport_id']) ? intval($request['sport_id']) : 1;
        
        // In production, fetch from database based on sport_id
        // Example response with placeholder data
        $players = array(
            array(
                'id' => 1,
                'name' => 'Stephen Curry',
                'position' => 'PG',
                'team' => 'GSW',
                'salary' => 9800,
                'projectedPoints' => 48.7,
                'photo' => '',
                'stats' => array(
                    'points' => 28.5,
                    'rebounds' => 5.2,
                    'assists' => 6.3
                )
            ),
            array(
                'id' => 2,
                'name' => 'LeBron James',
                'position' => 'SF',
                'team' => 'LAL',
                'salary' => 10500,
                'projectedPoints' => 52.1,
                'photo' => '',
                'stats' => array(
                    'points' => 25.7,
                    'rebounds' => 7.4,
                    'assists' => 7.9
                )
            ),
            // Add more players as needed
        );
        
        return rest_ensure_response($players);
    }
    
    /**
     * Get teams list
     */
    public function get_teams($request) {
        $sport_id = isset($request['sport_id']) ? intval($request['sport_id']) : 1;
        
        // Example response with placeholder data
        $teams = array(
            array(
                'id' => 1,
                'name' => 'Golden State Warriors',
                'abbreviation' => 'GSW',
                'logo' => '',
                'sportId' => 1
            ),
            array(
                'id' => 2,
                'name' => 'Los Angeles Lakers',
                'abbreviation' => 'LAL',
                'logo' => '',
                'sportId' => 1
            ),
            // Add more teams as needed
        );
        
        return rest_ensure_response($teams);
    }
    
    /**
     * Get events list
     */
    public function get_events($request) {
        $sport_id = isset($request['sport_id']) ? intval($request['sport_id']) : 1;
        
        // Example response with placeholder data
        $events = array(
            array(
                'id' => 1,
                'sportId' => 1,
                'homeTeamId' => 1,
                'awayTeamId' => 2,
                'startTime' => date('Y-m-d H:i:s', strtotime('+1 day')),
                'status' => 'scheduled',
                'homeScore' => 0,
                'awayScore' => 0,
                'period' => '',
                'timeRemaining' => '',
                'odds' => null
            ),
            // Add more events as needed
        );
        
        return rest_ensure_response($events);
    }
    
    /**
     * Proxy requests to the Odds API
     */
    public function proxy_odds_api($request) {
        $path = $request['path'];
        $api_key = get_option('weparlay_odds_api_key', '');
        
        if (empty($api_key)) {
            return new WP_Error('missing_api_key', 'The Odds API key is not configured.', array('status' => 400));
        }
        
        // Forward the request to the Odds API
        $url = 'https://api.the-odds-api.com/v4/' . $path;
        $url .= (strpos($url, '?') === false) ? '?' : '&';
        $url .= 'apiKey=' . urlencode($api_key);
        
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            return new WP_Error('odds_api_error', $response->get_error_message(), array('status' => 500));
        }
        
        $body = wp_remote_retrieve_body($response);
        $status = wp_remote_retrieve_response_code($response);
        
        if ($status !== 200) {
            return new WP_Error('odds_api_error', 'Error from The Odds API', array('status' => $status));
        }
        
        return json_decode($body);
    }
    
    /**
     * Authenticate with Yahoo (placeholder - would need real OAuth implementation)
     */
    public function authenticate_yahoo($request) {
        // This would be a real OAuth flow in production
        // For now, we're just returning a success response
        
        // Get current user
        $user_id = get_current_user_id();
        
        // In production, this would store real OAuth tokens
        update_user_meta($user_id, 'weparlay_yahoo_token', 'mock_token');
        update_user_meta($user_id, 'weparlay_yahoo_refresh_token', 'mock_refresh_token');
        update_user_meta($user_id, 'weparlay_yahoo_token_expiry', time() + 3600);
        
        return array(
            'success' => true,
            'message' => 'Yahoo Fantasy authenticated successfully.'
        );
    }
    
    /**
     * Get Yahoo Fantasy teams (placeholder)
     */
    public function get_yahoo_teams() {
        // In production, this would fetch from Yahoo's API
        $teams = array(
            array(
                'team_id' => '1',
                'name' => 'WeParlay All-Stars',
                'team_logo' => '',
                'team_stats' => array(
                    'wins' => 10,
                    'losses' => 5,
                    'ties' => 0,
                    'rank' => 3,
                    'points' => 1280,
                    'projected_points' => 154.2
                ),
                'league' => array(
                    'league_id' => '101',
                    'name' => 'WeParlay Pro League',
                    'season' => '2023',
                    'scoring_type' => 'H2H'
                )
            ),
            array(
                'team_id' => '2',
                'name' => 'WeParlay Dream Team',
                'team_logo' => '',
                'team_stats' => array(
                    'wins' => 12,
                    'losses' => 3,
                    'ties' => 0,
                    'rank' => 1,
                    'points' => 1450,
                    'projected_points' => 162.8
                ),
                'league' => array(
                    'league_id' => '202',
                    'name' => 'WeParlay Elite League',
                    'season' => '2023',
                    'scoring_type' => 'Roto'
                )
            )
        );
        
        return rest_ensure_response($teams);
    }
    
    /**
     * Get Yahoo team roster
     */
    public function get_yahoo_team_roster($request) {
        $team_id = $request['team_id'];
        
        // In production, this would fetch from Yahoo's API using the team_id
        // Example data for now
        $roster = array(
            array(
                'player_id' => '1',
                'name' => 'Stephen Curry',
                'position' => 'PG',
                'team' => 'GSW',
                'status' => 'active',
                'photo_url' => '',
                'salary' => 9800,
                'projected_points' => 48.7,
                'stats' => array(
                    'points' => 28.5,
                    'assists' => 6.3,
                    'rebounds' => 5.2,
                    'threes' => 4.5,
                    'steals' => 1.2,
                    'blocks' => 0.4
                ),
                'injury_status' => 'OK',
                'matchup' => array(
                    'opponent' => 'LAL',
                    'date' => date('Y-m-d\TH:i:s\Z', strtotime('+1 day')),
                    'home_away' => 'home',
                    'opponent_rank' => 15
                )
            ),
            array(
                'player_id' => '2',
                'name' => 'LeBron James',
                'position' => 'SF',
                'team' => 'LAL',
                'status' => 'active',
                'photo_url' => '',
                'salary' => 10500,
                'projected_points' => 52.1,
                'stats' => array(
                    'points' => 25.7,
                    'assists' => 7.9,
                    'rebounds' => 7.4,
                    'threes' => 2.2,
                    'steals' => 1.3,
                    'blocks' => 0.9
                ),
                'injury_status' => 'OK',
                'matchup' => array(
                    'opponent' => 'GSW',
                    'date' => date('Y-m-d\TH:i:s\Z', strtotime('+1 day')),
                    'home_away' => 'away',
                    'opponent_rank' => 4
                )
            ),
            // Add more players to complete a roster
            array(
                'player_id' => '3',
                'name' => 'Giannis Antetokounmpo',
                'position' => 'PF',
                'team' => 'MIL',
                'status' => 'active',
                'photo_url' => '',
                'salary' => 11500,
                'projected_points' => 56.8,
                'stats' => array(
                    'points' => 29.9,
                    'assists' => 5.8,
                    'rebounds' => 11.6,
                    'threes' => 0.8,
                    'steals' => 1.1,
                    'blocks' => 1.3
                ),
                'injury_status' => 'OK'
            ),
            array(
                'player_id' => '4',
                'name' => 'Nikola Jokic',
                'position' => 'C',
                'team' => 'DEN',
                'status' => 'active',
                'photo_url' => '',
                'salary' => 12000,
                'projected_points' => 60.2,
                'stats' => array(
                    'points' => 26.8,
                    'assists' => 9.0,
                    'rebounds' => 13.5
                ),
                'injury_status' => 'OK'
            ),
            array(
                'player_id' => '5',
                'name' => 'Devin Booker',
                'position' => 'SG',
                'team' => 'PHX',
                'status' => 'active',
                'photo_url' => '',
                'salary' => 9100,
                'projected_points' => 44.5,
                'stats' => array(
                    'points' => 28.2,
                    'assists' => 5.5,
                    'rebounds' => 4.7
                ),
                'injury_status' => 'OK'
            )
        );
        
        return rest_ensure_response($roster);
    }
    
    /**
     * Get user's fantasy teams
     */
    public function get_fantasy_teams() {
        $user_id = get_current_user_id();
        
        // In production, this would fetch from your database
        // Example data for now
        $teams = array(
            array(
                'id' => 1,
                'userId' => $user_id,
                'name' => 'My WeParlay Team',
                'sportId' => 1,
                'salary' => 45000,
                'maxSalary' => 50000,
                'createdAt' => date('Y-m-d H:i:s', strtotime('-2 days'))
            )
        );
        
        return rest_ensure_response($teams);
    }
    
    /**
     * Create a new fantasy team
     */
    public function create_fantasy_team($request) {
        $user_id = get_current_user_id();
        $params = $request->get_params();
        
        // Validate required fields
        if (empty($params['name']) || empty($params['sportId'])) {
            return new WP_Error('missing_fields', 'Name and sportId are required fields.', array('status' => 400));
        }
        
        // In production, this would create an entry in your database
        // Example response for now
        $new_team = array(
            'id' => 2, // In production, this would be auto-generated
            'userId' => $user_id,
            'name' => sanitize_text_field($params['name']),
            'sportId' => intval($params['sportId']),
            'salary' => 0,
            'maxSalary' => 50000,
            'yahooTeamId' => isset($params['yahooTeamId']) ? sanitize_text_field($params['yahooTeamId']) : null,
            'createdAt' => date('Y-m-d H:i:s')
        );
        
        return rest_ensure_response($new_team);
    }
}

// Initialize the REST API
new WeParlay_REST_API();