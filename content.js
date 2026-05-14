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
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        text-align: left !important;
        gap: 6px !important;
        padding: 10px 16px !important;
        font-size: 11px !important;
        border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        background: rgba(0,0,0,0.1) !important;
        width: 100% !important;
        box-sizing: border-box !important;
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

  const createBarRow = (label, current, limit, colorClass) => {
    const row = createElem('div', 'cl_row');
    const labelEl = createElem('div', 'cl_label', label);
    
    const barBg = createElem('div', 'cl_bar_bg');
    const barFill = createElem('div', `cl_bar_fill ${colorClass}`);
    const pct = Math.min(Math.round((current / limit) * 100), 100);
    barFill.style.width = `${pct}%`;
    barBg.appendChild(barFill);
    
    const pctLabel = createElem('div', 'cl_pct', `${pct}%`);
    
    row.appendChild(labelEl);
    row.appendChild(barBg);
    row.appendChild(pctLabel);
    return row;
  };

  const render = async () => {
    const container = insertContainer();
    if (!container) return;
    const data = await fetchUsage();
    container.innerHTML = '';

    // Header with Model and Cache
    const header = createElem('div', 'cl_row');
    const badge = createElem('div', 'cl_badge', `🤖 ${data.model}`);
    const timer = createElem('div', 'cl_label', `⏱️ ${data.cacheTimer}s`);
    timer.style.textAlign = 'right';
    header.appendChild(badge);
    header.appendChild(timer);
    container.appendChild(header);

    // Progress Rows
    container.appendChild(createBarRow('Tokens', data.tokensUsed, data.tokenLimit, 'cl_token_fill'));
    container.appendChild(createBarRow('Session', data.sessionUsed, data.sessionLimit, 'cl_session_fill'));
    container.appendChild(createBarRow('Weekly', data.weeklyUsed, data.weeklyLimit, 'cl_weekly_fill'));
  };

  // Initial render and periodic updates
  render();
  setInterval(render, POLL_INTERVAL);

  // Use MutationObserver to handle dynamic page changes (SPA)
  const observer = new MutationObserver(() => {
    if (!document.querySelector('.cl_usage_container')) {
      render();
    }
  });

  // Observe documentElement because body might not exist yet at document_start
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Listen for the daily‑refresh event fired by background.js
  window.addEventListener('CLAUDE_USAGE_DAILY_REFRESH', render);
})();
