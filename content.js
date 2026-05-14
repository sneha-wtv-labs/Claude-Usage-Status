// © 2026 Sneha. All rights reserved.
// Licensed under the MIT License.
// content.js – injects usage info into Claude.ai UI

(() => {
  const POLL_INTERVAL = 60 * 1000;
  console.log("🚀 Claude Usage Extension: Content script loaded!");

  const createElem = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  };

  const insertContainer = () => {
    // Try to find the message bar by looking for the contenteditable area's container
    // Claude usually wraps the input in a flex container with specific spacing
    const inputArea = document.querySelector('div[contenteditable="true"]');
    if (!inputArea) {
      console.log("🔍 Claude Usage Extension: Waiting for message input area...");
      return null;
    }

    // Go up to the container that holds the input and buttons
    const bar = inputArea.closest('fieldset') || 
                inputArea.closest('form') || 
                inputArea.parentElement.parentElement;
    
    if (!bar) return null;

    let container = bar.querySelector('.cl_usage_container');
    if (!container) {
      console.log("✨ Claude Usage Extension: Injecting usage bar!");
      container = createElem('div', 'cl_usage_container');
      // Style it to sit nicely at the top of the input area
      container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 12px;
        font-size: 11px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        background: rgba(0,0,0,0.1);
        width: 100%;
        border-radius: 8px 8px 0 0;
      `;
      bar.prepend(container); // Put it at the top of the message box
    }
    return container;
  };

  // Approximate fetch of usage data – real implementation would call Claude's internal API.
  const fetchUsage = async () => {
    try {
      // Try to pull from the Settings UI if it exists in the DOM.
      const settingsBtn = document.querySelector('a[href*="/settings"]');
      if (settingsBtn) {
        // Open the settings modal (if not already open) – simulate click.
        settingsBtn.click();
        await new Promise(r => setTimeout(r, 500)); // wait for UI to load
      }
      const usageElem = document.querySelector('.usage-stats'); // hypothetical class
      if (usageElem) {
        // Parse numbers – this is heavily dependent on Claude UI.
        const txt = usageElem.innerText.replace(/[^0-9./%]+/g, ' ').trim();
        const parts = txt.split(/\s+/);
        return {
          tokensUsed: parseInt(parts[0]) || 0,
          tokenLimit: parseInt(parts[1]) || 1000000,
          cacheTimer: parseInt(parts[2]) || 0,
          sessionUsed: parseInt(parts[3]) || 0,
          sessionLimit: parseInt(parts[4]) || 0,
          weeklyUsed: parseInt(parts[5]) || 0,
          weeklyLimit: parseInt(parts[6]) || 0,
          model: parts[7] || 'claude'
        };
      }
    } catch (e) {
      console.error('Claude Usage extension error parsing settings', e);
    }
    // Fallback dummy data
    return {
      tokensUsed: 12345,
      tokenLimit: 200000,
      cacheTimer: 30,
      sessionUsed: 5,
      sessionLimit: 25,
      weeklyUsed: 40,
      weeklyLimit: 200,
      model: 'claude-3-haiku-20240307'
    };
  };

  const render = async () => {
    const container = insertContainer();
    if (!container) return;
    const data = await fetchUsage();
    container.innerHTML = '';

    // Token bar
    const tokenBar = createElem('div', 'cl_token_bar');
    tokenBar.textContent = `🪙 ${data.tokensUsed}/${data.tokenLimit}`;
    container.appendChild(tokenBar);

    // Cache timer
    const cache = createElem('div', 'cl_cache_timer');
    cache.textContent = `⏱️ ${data.cacheTimer}s`;
    container.appendChild(cache);

    // Session / weekly usage
    const usage = createElem('div', 'cl_usage_summary');
    usage.textContent = `📊 Session ${data.sessionUsed}/${data.sessionLimit} | Weekly ${data.weeklyUsed}/${data.weeklyLimit}`;
    container.appendChild(usage);

    // Model badge
    const model = createElem('div', 'cl_model_badge');
    model.textContent = `🤖 ${data.model}`;
    container.appendChild(model);
  };

  // Initial render and periodic updates
  render();
  setInterval(render, POLL_INTERVAL);

  // Use MutationObserver to handle dynamic page changes (SPA)
  const observer = new MutationObserver((mutations) => {
    // If the usage container isn't in the DOM, try to re-render
    if (!document.querySelector('.cl_usage_container')) {
      render();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Listen for the daily‑refresh event fired by background.js
  window.addEventListener('CLAUDE_USAGE_DAILY_REFRESH', render);
})();
