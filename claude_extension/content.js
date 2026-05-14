// content.js – injects usage info into Claude.ai UI
// NOTE: This is an approximation. It reads usage data from the
// settings page (if present) or falls back to dummy values.

(() => {
  const POLL_INTERVAL = 60 * 1000; // refresh every minute

  // Helper: create an element with class and text
  const createElem = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  };

  // Insert a container into Claude's message bar
  const insertContainer = () => {
    // Find the message bar – Claude uses a <div id="message-bar"> or similar.
    const bar = document.querySelector('#message-bar') || document.querySelector('.message-bar');
    if (!bar) return null;
    let container = bar.querySelector('.cl_usage_container');
    if (!container) {
      container = createElem('div', 'cl_usage_container');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '12px';
      container.style.marginLeft = 'auto';
      bar.appendChild(container);
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
})();
