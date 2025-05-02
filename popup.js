// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const apiKeySection = document.querySelector('.api-key-setting');
    const aiProviderSelect = document.getElementById('ai-provider');
    
    // Show/hide API key field based on provider selection
    aiProviderSelect.addEventListener('change', function() {
      if (this.value === 'browser') {
        apiKeySection.style.display = 'none';
      } else {
        apiKeySection.style.display = 'block';
      }
    });
    
    // Load saved settings
    chrome.storage.sync.get(['apiKey', 'improvementLevel', 'tone', 'aiProvider'], function(data) {
      if (data.apiKey) document.getElementById('api-key').value = data.apiKey;
      if (data.improvementLevel) document.getElementById('improvement-level').value = data.improvementLevel;
      if (data.tone) document.getElementById('tone').value = data.tone;
      if (data.aiProvider) {
        document.getElementById('ai-provider').value = data.aiProvider;
        // Show/hide API key field based on saved provider
        if (data.aiProvider === 'browser') {
          apiKeySection.style.display = 'none';
        } else {
          apiKeySection.style.display = 'block';
        }
      }
    });
  
    // Save settings
    document.getElementById('save-settings').addEventListener('click', function() {
      const apiKey = document.getElementById('api-key').value;
      const improvementLevel = document.getElementById('improvement-level').value;
      const tone = document.getElementById('tone').value;
      const aiProvider = document.getElementById('ai-provider').value;
      
      chrome.storage.sync.set({ apiKey, improvementLevel, tone, aiProvider }, function() {
        const status = document.getElementById('status');
        status.textContent = 'Settings saved!';
        setTimeout(function() {
          status.textContent = '';
        }, 2000);
      });
    });
  });