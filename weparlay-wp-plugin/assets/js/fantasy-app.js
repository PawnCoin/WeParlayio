/**
 * WeParlay Fantasy Sports application
 * This file will be replaced with the actual compiled JS during the build process
 */

// Simple placeholder implementation
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('WeParlay Fantasy Sports Plugin initialized');
    
    // Find all WeParlay containers
    const containers = document.querySelectorAll('.weparlay-app-container');
    
    containers.forEach(function(container) {
      // Create placeholder content
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <h2 style="color: var(--primary, #4B72FF);">WeParlay Fantasy Sports</h2>
          <p>The fantasy sports application will appear here.</p>
          <p>This is a placeholder. The actual application will be loaded after building.</p>
          <div class="weparlay-app-loading"></div>
        </div>
      `;
    });
  });
})();