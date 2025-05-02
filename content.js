// content.js - Enhanced version to better detect compose windows
(function() {
  // Track email compose windows
  let emailComposeObserver = null;
  let improveButton = null;
  let processingEmail = false;
  let buttonCheckInterval = null;

  // Debug logging (helps to see if the extension is working)
  function log(message) {
    console.log(`[Email Improver AI] ${message}`);
  }

  // Check if we're on a supported email page
  function initializeEmailImprover() {
    log('Initializing Email Improver');
    
    if (window.location.href.includes('mail.google.com')) {
      log('Gmail detected');
      setupGmailIntegration();
    } else if (window.location.href.includes('outlook')) {
      log('Outlook detected');
      setupOutlookIntegration();
    }
    
    // Also start a periodic check for compose windows
    // This helps catch windows that might appear when the observer misses them
    if (!buttonCheckInterval) {
      buttonCheckInterval = setInterval(checkForComposeWindows, 2000);
    }
  }

  // Periodically check for compose windows
  function checkForComposeWindows() {
    if (window.location.href.includes('mail.google.com')) {
      const composeWindows = document.querySelectorAll('.Am.Al.editable');
      composeWindows.forEach(window => {
        const parentContainer = findComposeContainer(window);
        if (parentContainer && !parentContainer.querySelector('.ai-improve-button')) {
          log('Found Gmail compose window during check');
          createImproveButton(parentContainer, 'gmail');
        }
      });
    } else if (window.location.href.includes('outlook')) {
      const composeWindows = document.querySelectorAll('[role="textbox"]');
      composeWindows.forEach(window => {
        const parentContainer = findComposeContainer(window);
        if (parentContainer && !parentContainer.querySelector('.ai-improve-button')) {
          log('Found Outlook compose window during check');
          createImproveButton(parentContainer, 'outlook');
        }
      });
    }
  }

  // Find the parent container of the compose window
  function findComposeContainer(element) {
    // For Gmail
    if (window.location.href.includes('mail.google.com')) {
      // Try multiple approaches to find the container
      let container = element.closest('.AD');
      if (!container) container = element.closest('.M9');
      if (!container) container = element.closest('.Am.Al.editable').parentElement;
      return container;
    } 
    // For Outlook
    else if (window.location.href.includes('outlook')) {
      let container = element.closest('.ms-Modal');
      if (!container) container = element.closest('.compose-form');
      if (!container) container = element.closest('[role="dialog"]');
      return container;
    }
    return null;
  }

  // Setup for Gmail
  function setupGmailIntegration() {
    // Observer to detect when compose window appears
    emailComposeObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          checkForGmailComposeElements();
        }
      }
    });

    // Start observing for compose windows
    emailComposeObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also check immediately in case the compose window is already open
    checkForGmailComposeElements();
  }
  
  function checkForGmailComposeElements() {
    // Multiple possible selectors for Gmail compose areas
    const possibleSelectors = [
      '.Am.Al.editable', // Main compose area
      '.aA5.T-I', // Reply area
      '.Ar.Au', // Alternative compose area
      '[role="textbox"]' // Generic textbox role
    ];
    
    for (const selector of possibleSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(element => {
          const composeContainer = findComposeContainer(element);
          if (composeContainer && !composeContainer.querySelector('.ai-improve-button')) {
            log(`Found Gmail compose element with selector: ${selector}`);
            createImproveButton(composeContainer, 'gmail');
          }
        });
      }
    }
  }

  // Setup for Outlook
  function setupOutlookIntegration() {
    // Similar logic for Outlook
    emailComposeObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          checkForOutlookComposeElements();
        }
      }
    });

    // Start observing for compose windows
    emailComposeObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also check immediately
    checkForOutlookComposeElements();
  }
  
  function checkForOutlookComposeElements() {
    // Multiple possible selectors for Outlook compose areas
    const possibleSelectors = [
      '[role="textbox"]', // Standard textbox
      '.elementToProof', // Another possible class
      '.editorWrapper', // Wrapper for the editor
      '.composer-body' // Body of the composer
    ];
    
    for (const selector of possibleSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(element => {
          const composeContainer = findComposeContainer(element);
          if (composeContainer && !composeContainer.querySelector('.ai-improve-button')) {
            log(`Found Outlook compose element with selector: ${selector}`);
            createImproveButton(composeContainer, 'outlook');
          }
        });
      }
    }
  }

  // Create the "Improve with AI" button
  function createImproveButton(composeWindow, emailClient) {
    // Check if button already exists in this compose window
    if (composeWindow.querySelector('.ai-improve-button')) {
      return;
    }

    improveButton = document.createElement('button');
    improveButton.textContent = 'Improve with AI';
    improveButton.className = 'ai-improve-button';
    improveButton.style.cssText = `
      background-color: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
      margin: 10px 0;
      transition: background-color 0.2s;
      z-index: 9999;
    `;

    improveButton.addEventListener('mouseover', () => {
      improveButton.style.backgroundColor = '#3367d6';
    });

    improveButton.addEventListener('mouseout', () => {
      improveButton.style.backgroundColor = '#4285f4';
    });

    improveButton.addEventListener('click', () => {
      if (processingEmail) return;
      improveEmail(composeWindow, emailClient);
    });

    // Add button to compose window
    if (emailClient === 'gmail') {
      // Try multiple locations to add the button for Gmail
      let toolbar = composeWindow.querySelector('.aDh');
      if (!toolbar) toolbar = composeWindow.querySelector('.aDj');
      if (!toolbar) toolbar = composeWindow.querySelector('.aA5');
      if (!toolbar) toolbar = composeWindow.querySelector('.Ar.Au');
      
      // If we still can't find a toolbar, create our own and add it after the compose area
      if (!toolbar) {
        const composeArea = composeWindow.querySelector('.Am.Al.editable') || 
                           composeWindow.querySelector('[role="textbox"]');
        if (composeArea) {
          toolbar = document.createElement('div');
          toolbar.className = 'ai-improve-toolbar';
          toolbar.style.cssText = 'margin: 10px 0;';
          composeArea.parentNode.insertBefore(toolbar, composeArea.nextSibling);
        }
      }
      
      if (toolbar) {
        toolbar.appendChild(improveButton);
        log('Added button to Gmail compose window');
      } else {
        log('Could not find toolbar to add button in Gmail');
      }
    } else if (emailClient === 'outlook') {
      // Try multiple locations to add the button for Outlook
      let toolbar = composeWindow.querySelector('.ms-CommandBar');
      if (!toolbar) toolbar = composeWindow.querySelector('.owa-composer-toolbar');
      if (!toolbar) toolbar = composeWindow.querySelector('.CommandBar');
      
      // If we still can't find a toolbar, create our own
      if (!toolbar) {
        const composeArea = composeWindow.querySelector('[role="textbox"]');
        if (composeArea) {
          toolbar = document.createElement('div');
          toolbar.className = 'ai-improve-toolbar';
          toolbar.style.cssText = 'margin: 10px 0;';
          composeArea.parentNode.insertBefore(toolbar, composeArea.nextSibling);
        }
      }
      
      if (toolbar) {
        toolbar.appendChild(improveButton);
        log('Added button to Outlook compose window');
      } else {
        log('Could not find toolbar to add button in Outlook');
      }
    }
  }

  // Process the email text with AI
  function improveEmail(composeWindow, emailClient) {
    processingEmail = true;
    improveButton.textContent = 'Processing...';
    
    // Get email content
    let emailContent = '';
    let textbox = null;
    
    if (emailClient === 'gmail') {
      textbox = composeWindow.querySelector('[role="textbox"]') || 
               composeWindow.querySelector('.Am.Al.editable');
    } else if (emailClient === 'outlook') {
      textbox = composeWindow.querySelector('[role="textbox"]');
    }
    
    if (textbox) {
      emailContent = textbox.innerHTML;
    } else {
      showError('Could not find email content');
      return;
    }

    // Get settings
    chrome.storage.sync.get(['apiKey', 'improvementLevel', 'tone', 'aiProvider'], function(data) {
      // For browser-based, we don't need an API key
      if (data.aiProvider !== 'browser' && !data.apiKey) {
        showError('API key is required for this AI provider. Please set it in the extension settings.');
        processingEmail = false;
        improveButton.textContent = 'Improve with AI';
        return;
      }

      // Format email content to plain text
      const plainTextContent = emailContent.replace(/<[^>]*>/g, ' ');
      
      // Call AI API to improve the email
      callAIService(plainTextContent, data)
        .then(improvedContent => {
          // Apply improvements
          applyImprovements(composeWindow, emailClient, improvedContent);
          improveButton.textContent = 'Improve with AI';
          processingEmail = false;
        })
        .catch(error => {
          showError('Error improving email: ' + error.message);
          improveButton.textContent = 'Improve with AI';
          processingEmail = false;
        });
    });
  }

  // Call the AI service to improve the email
  function callAIService(emailContent, settings) {
    return new Promise((resolve, reject) => {
      const aiProvider = settings.aiProvider || 'browser';
      const apiKey = settings.apiKey || '';
      const improvementLevel = settings.improvementLevel || 'medium';
      const tone = settings.tone || 'professional';
      
      log(`Using AI provider: ${aiProvider}`);
      
      // Option 1: Use Google Gemini (free tier)
      // Updated Gemini API call using Gemini 1.5 Pro
if (aiProvider === 'gemini' && apiKey) {
  // Current Gemini API endpoint and model
  fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { 
              text: `You are an email improvement assistant. Please improve the following email:
              
              Improvement level: ${improvementLevel}
              Tone: ${tone}
              Keep the core message intact but enhance clarity, professionalism, and impact.
              Return only the improved email text without any explanations or additional formatting.
              
              EMAIL TO IMPROVE:
              ${emailContent}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.candidates && data.candidates[0] && data.candidates[0].content && 
        data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      resolve(data.candidates[0].content.parts[0].text);
    } else {
      reject(new Error('Invalid Gemini API response structure'));
    }
  })
  .catch(error => reject(error));
  }
      // Option 2: Use OpenAI API
      else if (aiProvider === 'openai' && apiKey) {
        fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system", 
                content: `You are an email improvement assistant that makes emails more ${tone}. 
                         Make ${improvementLevel} level improvements to clarity and effectiveness. 
                         Keep the core message intact.`
              },
              {
                role: "user",
                content: `Improve this email: ${emailContent}`
              }
            ],
            temperature: 0.3,
            max_tokens: 1024
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.choices && data.choices[0] && data.choices[0].message) {
            resolve(data.choices[0].message.content);
          } else {
            reject(new Error('Invalid OpenAI API response structure'));
          }
        })
        .catch(error => reject(error));
      }
      // Option 3: Use Hugging Face API
      else if (aiProvider === 'huggingface' && apiKey) {
        fetch('https://api-inference.huggingface.co/models/google/flan-t5-xxl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            inputs: `Improve this email to sound ${tone} and make ${improvementLevel} improvements: ${emailContent}`
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data[0] && data[0].generated_text) {
            resolve(data[0].generated_text);
          } else {
            reject(new Error('Invalid Hugging Face API response structure'));
          }
        })
        .catch(error => reject(error));
      }
      // Option 4: Use local browser-based processing (completely free)
      else {
        // Basic rule-based improvement (free, no API needed)
        try {
          // Simple email improvements without API
          let improved = emailContent;
          
          // Basic grammar fixes
          improved = improved.replace(/i /g, "I ");
          improved = improved.replace(/\bi'm\b/g, "I'm");
          improved = improved.replace(/\bim\b/g, "I'm");
          improved = improved.replace(/\bdont\b/g, "don't");
          improved = improved.replace(/\bcant\b/g, "can't");
          
          // Professional tone improvements
          improved = improved.replace(/\bkinda\b/g, "somewhat");
          improved = improved.replace(/\bgonna\b/g, "going to");
          improved = improved.replace(/\bwanna\b/g, "want to");
          improved = improved.replace(/\byeah\b/g, "yes");
          improved = improved.replace(/\bnope\b/g, "no");
          
          // Add polite openings/closings if missing
          if (!/^(Dear|Hello|Hi|Greetings|Good morning|Good afternoon|Good evening)/i.test(improved)) {
            improved = "Hello,\n\n" + improved;
          }
          
          if (!/(?:regards|sincerely|thank|best|yours|appreciate)/i.test(improved)) {
            improved += "\n\nBest regards";
          }
          
          // Remove excessive exclamation marks
          improved = improved.replace(/!{2,}/g, "!");
          
          // Formatting
          improved = improved.replace(/\n{3,}/g, "\n\n"); // Remove excessive line breaks
          
          // For thorough level, use more extensive replacements
          if (improvementLevel === 'thorough') {
            // More professional phrases
            improved = improved.replace(/\bfyi\b/gi, "for your information");
            improved = improved.replace(/\basap\b/gi, "as soon as possible");
            improved = improved.replace(/\bbtw\b/gi, "by the way");
          }
          
          resolve(improved);
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  // Apply the improvements to the email compose window
  function applyImprovements(composeWindow, emailClient, improvedContent) {
    // Create a suggestions panel
    const suggestionsPanel = document.createElement('div');
    suggestionsPanel.className = 'ai-suggestions-panel';
    suggestionsPanel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 20px;
      z-index: 9999;
      max-width: 600px;
      width: 80%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    suggestionsPanel.innerHTML = `
      <h2 style="margin-top: 0; color: #4285f4;">Improved Email</h2>
      <div style="margin-bottom: 15px; border: 1px solid #eee; padding: 10px; max-height: 300px; overflow-y: auto;">
        ${improvedContent}
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button id="reject-suggestions" style="padding: 8px 16px; background-color: #f1f1f1; border: none; border-radius: 4px; cursor: pointer;">Reject</button>
        <button id="accept-suggestions" style="padding: 8px 16px; background-color: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">Accept</button>
      </div>
    `;

    // Add panel to the document
    document.body.appendChild(suggestionsPanel);

    // Add event listeners for accept/reject buttons
    document.getElementById('accept-suggestions').addEventListener('click', () => {
      let textbox = null;
      
      if (emailClient === 'gmail') {
        textbox = composeWindow.querySelector('[role="textbox"]') || 
                 composeWindow.querySelector('.Am.Al.editable');
      } else if (emailClient === 'outlook') {
        textbox = composeWindow.querySelector('[role="textbox"]');
      }
      
      if (textbox) {
        textbox.innerHTML = improvedContent;
        log('Applied improved content to email');
      } else {
        showError('Could not find email content area');
      }
      
      suggestionsPanel.remove();
    });

    document.getElementById('reject-suggestions').addEventListener('click', () => {
      suggestionsPanel.remove();
    });
  }

  // Show error message
  function showError(message) {
    log('ERROR: ' + message);
    improveButton.textContent = 'Improve with AI';
    alert('Email Improver AI: ' + message);
  }

  // Initialize when the page loads
  window.addEventListener('load', initializeEmailImprover);

  // Also try to initialize immediately in case the page is already loaded
  setTimeout(initializeEmailImprover, 1000);

  // Re-initialize whenever the URL changes (for single page apps like Gmail)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      log('URL changed, reinitializing');
      initializeEmailImprover();
    }
  }).observe(document, {subtree: true, childList: true});
  
})();