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
                    var gameCard = $(this).closest('.game-card');
                    var oddsType = $(this).closest('.slip-item').find('.slip-item-details div:last-child').text().split(':')[0].trim();
                    
                    // Find and deselect the matching odds box
                    $('.game-card').each(function() {
                        if ($(this).find('.game-header h4').text() === gameTitle) {
                            $(this).find('.odds-box').each(function() {
                                if ($(this).find('.odds-type').text() === oddsType) {
                                    $(this).removeClass('selected');
                                }
                            });
                        }
                    });
                    
                    // Remove the slip item
                    $(this).closest('.slip-item').remove();
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
        
        // Handle odds format toggle
        $('#odds-format-toggle').on('change', function() {
            var format = $(this).val();
            convertOddsFormat(format);
        });
        
        // Convert odds to different formats
        function convertOddsFormat(format) {
            $('.odds-value').each(function() {
                var decimalOdds = parseFloat($(this).data('decimal-odds') || $(this).text());
                
                if (isNaN(decimalOdds)) return;
                
                var newOdds;
                
                switch (format) {
                    case 'decimal':
                        newOdds = decimalOdds.toFixed(2);
                        break;
                    case 'american':
                        if (decimalOdds >= 2) {
                            newOdds = '+' + Math.round((decimalOdds - 1) * 100);
                        } else {
                            newOdds = Math.round(-100 / (decimalOdds - 1));
                        }
                        break;
                    case 'fractional':
                        var decimal = decimalOdds - 1;
                        var gcd = function(a, b) {
                            return b ? gcd(b, a % b) : a;
                        };
                        var decimal100 = decimal * 100;
                        var divisor = gcd(decimal100, 100);
                        var numerator = decimal100 / divisor;
                        var denominator = 100 / divisor;
                        newOdds = numerator + '/' + denominator;
                        break;
                    default:
                        newOdds = decimalOdds.toFixed(2);
                }
                
                $(this).text(newOdds);
                
                // Store original decimal odds if not already stored
                if (!$(this).data('decimal-odds')) {
                    $(this).data('decimal-odds', decimalOdds);
                }
            });
        }
        
        // Initialize live betting updates
        function initLiveBetting() {
            // Simulate real-time score updates
            if ($('.live-score').length > 0) {
                setInterval(function() {
                    $('.live-badge').each(function() {
                        var gameCard = $(this).closest('.game-card');
                        var homeScore = parseInt(gameCard.find('.live-score').first().text());
                        var awayScore = parseInt(gameCard.find('.live-score').last().text());
                        
                        // Randomly decide if score should change (10% chance)
                        if (Math.random() < 0.1) {
                            // 50% chance to update home team score
                            if (Math.random() < 0.5) {
                                homeScore += 1;
                                gameCard.find('.live-score').first().text(homeScore);
                                
                                // Flash animation for scoring
                                gameCard.find('.live-score').first().addClass('score-update');
                                setTimeout(function() {
                                    gameCard.find('.live-score').first().removeClass('score-update');
                                }, 1000);
                            } 
                            // 50% chance to update away team score
                            else {
                                awayScore += 1;
                                gameCard.find('.live-score').last().text(awayScore);
                                
                                // Flash animation for scoring
                                gameCard.find('.live-score').last().addClass('score-update');
                                setTimeout(function() {
                                    gameCard.find('.live-score').last().removeClass('score-update');
                                }, 1000);
                            }
                            
                            // Update odds based on new score
                            updateLiveOdds(gameCard, homeScore, awayScore);
                        }
                        
                        // Update game clock/period
                        updateGameClock(gameCard);
                    });
                }, 15000); // Every 15 seconds
            }
        }
        
        // Update game clock
        function updateGameClock(gameCard) {
            var periodElem = gameCard.find('.live-period');
            if (periodElem.length === 0) return;
            
            var periodText = periodElem.text();
            var parts = periodText.split(' - ');
            
            if (parts.length !== 2) return;
            
            var period = parts[0];
            var timeRemaining = parts[1];
            
            // Parse time
            var timeMatch = timeRemaining.match(/(\d+):(\d+)/);
            if (timeMatch) {
                var minutes = parseInt(timeMatch[1]);
                var seconds = parseInt(timeMatch[2]);
                
                // Decrease time by 10-20 seconds
                var decreaseBy = Math.floor(Math.random() * 11) + 10;
                var totalSeconds = minutes * 60 + seconds;
                totalSeconds -= decreaseBy;
                
                if (totalSeconds <= 0) {
                    // Go to next period
                    var periodMatch = period.match(/(\d+)(\w+)/);
                    if (periodMatch) {
                        var periodNum = parseInt(periodMatch[1]);
                        var periodType = periodMatch[2];
                        
                        // Handle period transitions
                        if (periodNum < 4 && periodType === 'th') {
                            periodNum++;
                            period = periodNum + 'th Quarter';
                            totalSeconds = 12 * 60; // Reset to 12 minutes
                        } else if (periodNum === 4 && totalSeconds <= 0) {
                            // Game over
                            period = 'Final';
                            timeRemaining = '';
                        } else if (periodType === 'rd' && periodNum < 3) {
                            periodNum++;
                            period = periodNum + 'rd Period';
                            totalSeconds = 20 * 60; // Reset to 20 minutes (hockey)
                        } else {
                            // Default behavior
                            totalSeconds = 0;
                        }
                    }
                }
                
                if (totalSeconds > 0) {
                    minutes = Math.floor(totalSeconds / 60);
                    seconds = totalSeconds % 60;
                    timeRemaining = minutes + ':' + (seconds < 10 ? '0' : '') + seconds + ' remaining';
                }
                
                // Update the display
                if (period === 'Final') {
                    periodElem.text('Final');
                } else {
                    periodElem.text(period + ' - ' + timeRemaining);
                }
            }
        }
        
        // Update live odds based on score
        function updateLiveOdds(gameCard, homeScore, awayScore) {
            var homeLead = homeScore - awayScore;
            var oddsBoxes = gameCard.find('.odds-box');
            
            if (oddsBoxes.length >= 2) {
                var homeWinBox = $(oddsBoxes[0]);
                var awayWinBox = $(oddsBoxes[1]);
                
                var homeOddsElem = homeWinBox.find('.odds-value');
                var awayOddsElem = awayWinBox.find('.odds-value');
                
                var homeOdds = parseFloat(homeOddsElem.data('decimal-odds') || homeOddsElem.text());
                var awayOdds = parseFloat(awayOddsElem.data('decimal-odds') || awayOddsElem.text());
                
                // Adjust odds based on score difference
                if (homeLead > 0) {
                    // Home team leading
                    homeOdds -= 0.05 * homeLead;
                    if (homeOdds < 1.05) homeOdds = 1.05;
                    
                    awayOdds += 0.2 * homeLead;
                } else if (homeLead < 0) {
                    // Away team leading
                    awayOdds -= 0.05 * Math.abs(homeLead);
                    if (awayOdds < 1.05) awayOdds = 1.05;
                    
                    homeOdds += 0.2 * Math.abs(homeLead);
                }
                
                // Format to 2 decimal places
                homeOdds = homeOdds.toFixed(2);
                awayOdds = awayOdds.toFixed(2);
                
                // Store and display
                homeOddsElem.data('decimal-odds', homeOdds);
                awayOddsElem.data('decimal-odds', awayOdds);
                
                homeOddsElem.text(homeOdds);
                awayOddsElem.text(awayOdds);
                
                // Flash animation for odds change
                homeOddsElem.addClass('odds-update');
                awayOddsElem.addClass('odds-update');
                
                setTimeout(function() {
                    homeOddsElem.removeClass('odds-update');
                    awayOddsElem.removeClass('odds-update');
                }, 1000);
            }
        }
        
        // Initialize live betting features
        initLiveBetting();
        
        // Initialize head-to-head challenge functionality
        $('.challenge-form').on('submit', function(e) {
            e.preventDefault();
            
            var selectedEvent = $('#challenge-event').val();
            var selectedBet = $('#challenge-bet-type').val();
            var stakeAmount = $('#challenge-stake').val();
            var opponent = $('#challenge-opponent').val();
            
            if (!selectedEvent || !selectedBet || !stakeAmount || !opponent) {
                alert('Please fill out all fields.');
                return;
            }
            
            // Here you would normally send the challenge to the server
            // For this demo, we'll simulate a successful challenge
            $('.challenge-form').html('<div class="alert alert-success">Challenge sent to ' + opponent + '!</div>');
        });
    });
    
})(jQuery);