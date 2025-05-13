/**
 * Admin JavaScript for WeParlay settings page
 */
(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Initialize color pickers
        $('.weparlay-color-field').wpColorPicker();
        
        // Handle API key validation
        $('.weparlay-validate-api-key').on('click', function(e) {
            e.preventDefault();
            
            const $button = $(this);
            const $resultMessage = $('.weparlay-api-validation-result');
            const apiKey = $('#weparlay_odds_api_key').val();
            
            if (!apiKey) {
                $resultMessage.html('<span class="error">Please enter an API key.</span>');
                return;
            }
            
            $button.prop('disabled', true).text('Validating...');
            $resultMessage.html('<span class="pending">Checking API key...</span>');
            
            // AJAX request to validate the API key
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'weparlay_validate_api_key',
                    api_key: apiKey,
                    nonce: weparlayAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        $resultMessage.html('<span class="success">API key is valid!</span>');
                    } else {
                        $resultMessage.html('<span class="error">Invalid API key: ' + response.data.message + '</span>');
                    }
                },
                error: function() {
                    $resultMessage.html('<span class="error">Error validating API key. Please try again.</span>');
                },
                complete: function() {
                    $button.prop('disabled', false).text('Validate API Key');
                }
            });
        });
    });
    
})(jQuery);