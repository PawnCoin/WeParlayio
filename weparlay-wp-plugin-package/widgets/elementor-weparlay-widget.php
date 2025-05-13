<?php
/**
 * Elementor widget for WeParlay Fantasy Sports
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Elementor_WeParlay_Widget extends \Elementor\Widget_Base {
    /**
     * Get widget name
     */
    public function get_name() {
        return 'weparlay_fantasy';
    }
    
    /**
     * Get widget title
     */
    public function get_title() {
        return 'WeParlay Fantasy Sports';
    }
    
    /**
     * Get widget icon
     */
    public function get_icon() {
        return 'eicon-apps';
    }
    
    /**
     * Get widget categories
     */
    public function get_categories() {
        return ['general'];
    }
    
    /**
     * Register widget controls
     */
    protected function _register_controls() {
        // Content Section
        $this->start_controls_section(
            'content_section',
            [
                'label' => 'Settings',
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );
        
        $this->add_control(
            'title',
            [
                'label' => 'Title',
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => 'Fantasy Team Builder',
                'placeholder' => 'Enter title',
            ]
        );
        
        $this->add_control(
            'sport_id',
            [
                'label' => 'Sport',
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => '1',
                'options' => [
                    '1' => 'Basketball',
                    '2' => 'Football',
                    '3' => 'Baseball',
                    '4' => 'Hockey',
                ],
            ]
        );
        
        $this->add_control(
            'contest_id',
            [
                'label' => 'Contest ID',
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => '',
                'placeholder' => 'Optional contest ID',
            ]
        );
        
        $this->add_control(
            'read_only',
            [
                'label' => 'Read Only',
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'true',
                'default' => 'false',
            ]
        );
        
        $this->end_controls_section();
        
        // Style Section
        $this->start_controls_section(
            'style_section',
            [
                'label' => 'Colors',
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );
        
        $this->add_control(
            'use_custom_colors',
            [
                'label' => 'Use Custom Colors',
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'default' => 'no',
            ]
        );
        
        $this->add_control(
            'primary_color',
            [
                'label' => 'Primary Color',
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => '#4B72FF',
                'condition' => [
                    'use_custom_colors' => 'yes',
                ],
            ]
        );
        
        $this->add_control(
            'secondary_color',
            [
                'label' => 'Secondary Color',
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => '#4AE3B5',
                'condition' => [
                    'use_custom_colors' => 'yes',
                ],
            ]
        );
        
        $this->add_control(
            'background_color',
            [
                'label' => 'Background Color',
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => '',
                'selectors' => [
                    '{{WRAPPER}} .weparlay-app-container' => 'background-color: {{VALUE}};',
                ],
            ]
        );
        
        $this->end_controls_section();
        
        // Dimensions Section
        $this->start_controls_section(
            'dimensions_section',
            [
                'label' => 'Dimensions',
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );
        
        $this->add_responsive_control(
            'height',
            [
                'label' => 'Height',
                'type' => \Elementor\Controls_Manager::SLIDER,
                'size_units' => ['px', 'vh', '%'],
                'range' => [
                    'px' => [
                        'min' => 300,
                        'max' => 1500,
                        'step' => 10,
                    ],
                    'vh' => [
                        'min' => 10,
                        'max' => 100,
                        'step' => 1,
                    ],
                    '%' => [
                        'min' => 10,
                        'max' => 100,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 800,
                ],
                'selectors' => [
                    '{{WRAPPER}} .weparlay-app-container' => 'min-height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );
        
        $this->add_responsive_control(
            'padding',
            [
                'label' => 'Padding',
                'type' => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => ['px', 'em', '%'],
                'selectors' => [
                    '{{WRAPPER}} .weparlay-app-container' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );
        
        $this->add_responsive_control(
            'border_radius',
            [
                'label' => 'Border Radius',
                'type' => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => ['px', 'em', '%'],
                'selectors' => [
                    '{{WRAPPER}} .weparlay-app-container' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );
        
        $this->end_controls_section();
    }
    
    /**
     * Render widget output
     */
    protected function render() {
        $settings = $this->get_settings_for_display();
        
        // Enqueue required assets
        wp_enqueue_script('weparlay-fantasy-app');
        wp_enqueue_style('weparlay-fantasy-styles');
        
        $container_id = 'weparlay-fantasy-app-' . uniqid();
        
        // Output custom inline style for colors if needed
        if ('yes' === $settings['use_custom_colors']) {
            echo '<style>
                #' . esc_attr($container_id) . ' {
                    --weparlay-primary: ' . esc_attr($settings['primary_color']) . ';
                    --weparlay-secondary: ' . esc_attr($settings['secondary_color']) . ';
                }
            </style>';
        }
        
        // Widget title
        if (!empty($settings['title'])) {
            echo '<h3 class="weparlay-widget-title">' . esc_html($settings['title']) . '</h3>';
        }
        
        // Output container for React app
        echo '<div id="' . esc_attr($container_id) . '" 
                   data-sport-id="' . esc_attr($settings['sport_id']) . '"
                   data-contest-id="' . esc_attr($settings['contest_id']) . '"
                   data-read-only="' . esc_attr($settings['read_only']) . '"
                   class="weparlay-app-container">
              </div>';
    }
}