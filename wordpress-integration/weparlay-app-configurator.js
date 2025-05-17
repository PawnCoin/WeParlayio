/**
 * WeParlay App Configurator
 * 
 * This script manages the admin panel for configuring app appearance and layout
 * which synchronizes design settings between WordPress and the app
 */

jQuery(document).ready(function($) {
    // Color picker initialization
    $('.weparlay-color-picker').wpColorPicker({
        change: function(event, ui) {
            updatePreview();
        }
    });
    
    // Image uploader for logo
    var logoUploader;
    $('#weparlay-logo-upload-button').click(function(e) {
        e.preventDefault();
        
        // If the uploader object has already been created, reopen the dialog
        if (logoUploader) {
            logoUploader.open();
            return;
        }
        
        // Create the media frame
        logoUploader = wp.media.frames.file_frame = wp.media({
            title: 'Select Logo',
            button: {
                text: 'Use this logo'
            },
            multiple: false
        });
        
        // When a file is selected, grab the URL and set it as the text field's value
        logoUploader.on('select', function() {
            var attachment = logoUploader.state().get('selection').first().toJSON();
            $('#weparlay-logo-url').val(attachment.url);
            $('.weparlay-logo-preview').attr('src', attachment.url).show();
            updatePreview();
        });
        
        // Open the uploader dialog
        logoUploader.open();
    });
    
    // Layout option handling
    $('input[name="weparlay_app_layout"]').change(function() {
        updatePreview();
    });
    
    // Widget position handling
    $('.weparlay-widget-position').sortable({
        update: function(event, ui) {
            updateWidgetOrder();
            updatePreview();
        }
    });
    
    // Update widget order in hidden field when sorted
    function updateWidgetOrder() {
        var widgetOrder = [];
        $('.weparlay-widget-position .weparlay-widget').each(function() {
            widgetOrder.push($(this).data('widget-id'));
        });
        $('#weparlay_widget_order').val(JSON.stringify(widgetOrder));
    }
    
    // Initial call to set the widget order
    updateWidgetOrder();
    
    // Toggle widget visibility
    $('.weparlay-widget-toggle').change(function() {
        var widgetId = $(this).data('widget-id');
        var isChecked = $(this).prop('checked');
        
        // Update the hidden field with visible widgets
        updateWidgetVisibility();
        
        // Update the preview
        if (isChecked) {
            $('.weparlay-preview-widget[data-widget-id="' + widgetId + '"]').show();
        } else {
            $('.weparlay-preview-widget[data-widget-id="' + widgetId + '"]').hide();
        }
    });
    
    // Update widget visibility in hidden field
    function updateWidgetVisibility() {
        var visibleWidgets = [];
        $('.weparlay-widget-toggle:checked').each(function() {
            visibleWidgets.push($(this).data('widget-id'));
        });
        $('#weparlay_visible_widgets').val(JSON.stringify(visibleWidgets));
    }
    
    // Initial call to set the widget visibility
    updateWidgetVisibility();
    
    // Font selection handling
    $('#weparlay_font_family').change(function() {
        updatePreview();
    });
    
    // Button style handling
    $('#weparlay_button_style').change(function() {
        updatePreview();
    });
    
    // Update the preview panel with current settings
    function updatePreview() {
        // Get current values
        var primaryColor = $('#weparlay_primary_color').val();
        var secondaryColor = $('#weparlay_secondary_color').val();
        var backgroundColor = $('#weparlay_background_color').val();
        var textColor = $('#weparlay_text_color').val();
        var fontFamily = $('#weparlay_font_family').val();
        var buttonStyle = $('#weparlay_button_style').val();
        var logoUrl = $('#weparlay-logo-url').val();
        var layout = $('input[name="weparlay_app_layout"]:checked').val();
        
        // Update preview panel colors
        $('.weparlay-preview-panel').css({
            'background-color': backgroundColor,
            'color': textColor,
            'font-family': fontFamily
        });
        
        // Update preview buttons
        $('.weparlay-preview-button').css({
            'background-color': primaryColor,
            'color': '#ffffff',
            'border-radius': (buttonStyle === 'rounded') ? '25px' : '4px'
        });
        
        // Update preview header
        $('.weparlay-preview-header').css({
            'background-color': secondaryColor,
            'color': '#ffffff'
        });
        
        // Update preview logo
        if (logoUrl) {
            $('.weparlay-preview-logo').attr('src', logoUrl).show();
        } else {
            $('.weparlay-preview-logo').hide();
        }
        
        // Update preview layout
        if (layout === 'boxed') {
            $('.weparlay-preview-container').css({
                'max-width': '1200px',
                'margin': '0 auto'
            });
        } else {
            $('.weparlay-preview-container').css({
                'max-width': '100%',
                'margin': '0'
            });
        }
        
        // Generate CSS for the app
        var appCss = generateAppCss();
        $('#weparlay_app_css').val(appCss);
        
        // Generate JSON config for the app
        var appConfig = generateAppConfig();
        $('#weparlay_app_config').val(JSON.stringify(appConfig));
    }
    
    // Generate CSS for the app based on settings
    function generateAppCss() {
        var css = `:root {
  --weparlay-primary: ${$('#weparlay_primary_color').val()};
  --weparlay-secondary: ${$('#weparlay_secondary_color').val()};
  --weparlay-background: ${$('#weparlay_background_color').val()};
  --weparlay-text: ${$('#weparlay_text_color').val()};
  --weparlay-font-family: ${$('#weparlay_font_family').val()};
  --weparlay-button-radius: ${$('#weparlay_button_style').val() === 'rounded' ? '25px' : '4px'};
}

body {
  font-family: var(--weparlay-font-family);
  background-color: var(--weparlay-background);
  color: var(--weparlay-text);
}

.button, button, .btn, .btn-primary {
  background-color: var(--weparlay-primary);
  border-radius: var(--weparlay-button-radius);
}

header, .header, nav, .navbar {
  background-color: var(--weparlay-secondary);
}`;
        
        return css;
    }
    
    // Generate JSON configuration for the app
    function generateAppConfig() {
        return {
            colors: {
                primary: $('#weparlay_primary_color').val(),
                secondary: $('#weparlay_secondary_color').val(),
                background: $('#weparlay_background_color').val(),
                text: $('#weparlay_text_color').val()
            },
            fonts: {
                family: $('#weparlay_font_family').val()
            },
            buttons: {
                style: $('#weparlay_button_style').val()
            },
            logo: {
                url: $('#weparlay-logo-url').val()
            },
            layout: $('input[name="weparlay_app_layout"]:checked').val(),
            widgets: {
                order: JSON.parse($('#weparlay_widget_order').val()),
                visible: JSON.parse($('#weparlay_visible_widgets').val())
            }
        };
    }
    
    // Initial preview update
    updatePreview();
    
    // Reset button functionality
    $('#weparlay-reset-defaults').click(function(e) {
        e.preventDefault();
        
        // Confirm reset
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            // Reset color pickers
            $('#weparlay_primary_color').val('#3498db').trigger('change');
            $('#weparlay_secondary_color').val('#2c3e50').trigger('change');
            $('#weparlay_background_color').val('#ffffff').trigger('change');
            $('#weparlay_text_color').val('#333333').trigger('change');
            
            // Reset font and button style
            $('#weparlay_font_family').val('Arial, sans-serif').trigger('change');
            $('#weparlay_button_style').val('rounded').trigger('change');
            
            // Reset logo
            $('#weparlay-logo-url').val('');
            $('.weparlay-logo-preview').attr('src', '').hide();
            
            // Reset layout
            $('input[name="weparlay_app_layout"][value="full-width"]').prop('checked', true).trigger('change');
            
            // Reset widgets to default order and visibility
            $('.weparlay-widget-toggle').prop('checked', true);
            updateWidgetVisibility();
            
            // Reset widget order to default
            $('.weparlay-widget-position').sortable('destroy');
            $('.weparlay-widget-position').html($('.weparlay-widget-position').html());
            $('.weparlay-widget-position').sortable({
                update: function(event, ui) {
                    updateWidgetOrder();
                    updatePreview();
                }
            });
            updateWidgetOrder();
            
            // Update preview with reset values
            updatePreview();
        }
    });
    
    // Sync settings button
    $('#weparlay-sync-now').click(function(e) {
        e.preventDefault();
        
        var button = $(this);
        var originalText = button.text();
        
        button.text('Syncing...').prop('disabled', true);
        
        // Generate the app configuration
        var appConfig = generateAppConfig();
        
        // Send to the server
        $.ajax({
            url: weparlayConfig.ajaxUrl,
            type: 'POST',
            data: {
                action: 'weparlay_sync_config',
                nonce: weparlayConfig.nonce,
                config: JSON.stringify(appConfig)
            },
            success: function(response) {
                if (response.success) {
                    button.text('Sync Successful!');
                    setTimeout(function() {
                        button.text(originalText).prop('disabled', false);
                    }, 2000);
                } else {
                    button.text('Sync Failed');
                    alert('Failed to sync configuration: ' + response.data.message);
                    setTimeout(function() {
                        button.text(originalText).prop('disabled', false);
                    }, 2000);
                }
            },
            error: function() {
                button.text('Sync Failed');
                alert('Failed to sync configuration. Please try again.');
                setTimeout(function() {
                    button.text(originalText).prop('disabled', false);
                }, 2000);
            }
        });
    });
});