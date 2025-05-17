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
    
    // Initialize any widgets that match the app
    function initWidgets() {
        // Tabs functionality
        $('.tab-nav-item').on('click', function() {
            var targetId = $(this).data('target');
            $('.tab-nav-item').removeClass('active');
            $(this).addClass('active');
            $('.tab-content').removeClass('active');
            $('#' + targetId).addClass('active');
        });
        
        // Sports navigation
        $('.sport-nav-item').on('click', function() {
            $('.sport-nav-item').removeClass('active');
            $(this).addClass('active');
        });
        
        // Currency toggle
        $('.currency-toggle').on('click', function() {
            $(this).toggleClass('real-money');
            
            if ($(this).hasClass('real-money')) {
                $('.currency-label').text('Real Money');
            } else {
                $('.currency-label').text('WeParlay Cash');
            }
        });
    }
    
    // Initialize any betting specific functionality
    function initBetting() {
        // Handle odds selection
        $('.odds-box').on('click', function() {
            $(this).toggleClass('selected');
            updateBettingSlip();
        });
        
        // Handle bet slip functionality
        function updateBettingSlip() {
            var selectedBets = $('.odds-box.selected');
            
            if (selectedBets.length > 0) {
                $('.betting-slip').addClass('has-bets');
                // Calculate potential winnings
                var stakeAmount = parseFloat($('#stake-amount').val()) || 0;
                var totalOdds = 1;
                
                selectedBets.each(function() {
                    var odds = parseFloat($(this).data('odds')) || 0;
                    totalOdds *= odds;
                });
                
                var potentialWinnings = stakeAmount * totalOdds;
                $('.potential-winnings-value').text('$' + potentialWinnings.toFixed(2));
            } else {
                $('.betting-slip').removeClass('has-bets');
                $('.potential-winnings-value').text('$0.00');
            }
        }
        
        // Handle stake input changes
        $('#stake-amount').on('input', function() {
            updateBettingSlip();
        });
        
        // Initialize bet slip
        updateBettingSlip();
    }
    
    // Initialize any confetti effects for winning bets
    function initConfetti() {
        $('.celebration-trigger').on('click', function() {
            var confettiSettings = {
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            };
            
            // This assumes you've loaded the canvas-confetti library
            if (typeof confetti !== 'undefined') {
                confetti(confettiSettings);
            }
        });
    }
    
    // Initialize any avatar customization
    function initAvatarCustomization() {
        $('.avatar-option').on('click', function() {
            $('.avatar-option').removeClass('selected');
            $(this).addClass('selected');
            var avatarSrc = $(this).find('img').attr('src');
            $('.avatar-preview img').attr('src', avatarSrc);
        });
    }
    
    // Document ready
    $(document).ready(function() {
        initWidgets();
        initBetting();
        initConfetti();
        initAvatarCustomization();
    });
    
})(jQuery);