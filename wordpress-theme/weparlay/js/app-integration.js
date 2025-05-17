/**
 * App Integration JavaScript for WeParlay Theme
 */
(function($) {
    'use strict';
    
    $(document).ready(function() {
        var iframe = document.getElementById('weparlay-app-iframe');
        
        if (iframe) {
            // Send theme colors to the app iframe
            function sendThemeColors() {
                var colors = {
                    primary: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-primary').trim(),
                    secondary: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-secondary').trim(),
                    background: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-background').trim(),
                    text: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-text').trim()
                };
                
                var fonts = {
                    family: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-font-family').trim()
                };
                
                var buttons = {
                    style: 'rounded',
                    radius: getComputedStyle(document.documentElement).getPropertyValue('--weparlay-button-radius').trim()
                };
                
                var logo = {
                    url: $('.site-logo').attr('src') || ''
                };
                
                var config = {
                    colors: colors,
                    fonts: fonts,
                    buttons: buttons,
                    logo: logo,
                    layout: 'full-width',
                    widgets: {
                        order: ['betting-slip', 'odds-comparison', 'live-events', 'trending-bets', 'user-profile'],
                        visible: ['betting-slip', 'odds-comparison', 'live-events', 'trending-bets', 'user-profile']
                    }
                };
                
                iframe.contentWindow.postMessage({
                    action: 'applyWordPressConfig',
                    config: config
                }, '*');
            }
            
            // Send theme colors when iframe loads
            iframe.addEventListener('load', function() {
                // Wait a moment for the iframe to fully initialize
                setTimeout(sendThemeColors, 1000);
                
                // Handle iframe height adjustments
                adjustIframeHeight();
            });
            
            // Handle messages from the iframe
            window.addEventListener('message', function(event) {
                // Check if the message is from our app
                if (!event.data || !event.data.action) {
                    return;
                }
                
                var data = event.data;
                
                // Handle resize requests
                if (data.action === 'resize') {
                    iframe.style.height = data.height + 'px';
                }
                
                // Handle navigation requests
                if (data.action === 'navigate') {
                    window.location.href = data.url;
                }
                
                // Handle login/authentication requests
                if (data.action === 'auth') {
                    // If your WordPress site has user authentication,
                    // you could implement integration here
                    var isLoggedIn = !!document.body.classList.contains('logged-in');
                    
                    if (isLoggedIn) {
                        // Send user data back to the app
                        var userData = {
                            action: 'authResponse',
                            loggedIn: true,
                            userId: document.body.dataset.userId || '',
                            username: document.body.dataset.username || '',
                            email: document.body.dataset.userEmail || ''
                        };
                        
                        iframe.contentWindow.postMessage(userData, '*');
                    } else {
                        // Send not logged in response
                        iframe.contentWindow.postMessage({
                            action: 'authResponse',
                            loggedIn: false
                        }, '*');
                    }
                }
            });
            
            // Adjust iframe height to content
            function adjustIframeHeight() {
                try {
                    var height = Math.max(
                        800,
                        iframe.contentWindow.document.body.scrollHeight,
                        iframe.contentWindow.document.documentElement.scrollHeight
                    );
                    
                    iframe.style.height = height + 'px';
                } catch(e) {
                    console.log('Could not adjust iframe height: ', e);
                }
            }
            
            // Set interval to periodically check if height needs adjustment
            setInterval(adjustIframeHeight, 2000);
        }
    });
    
})(jQuery);