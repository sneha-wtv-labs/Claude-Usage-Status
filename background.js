// © 2026 Sneha. All rights reserved.
// Licensed under the MIT License.
// background.js – runs a once‑daily “routine” that forces a refresh
// of usage data by invoking the content script indirectly.

chrome.runtime.onInstalled.addListener(() => {
  // Schedule the first alarm for the next midnight (local time)
  scheduleMidnightAlarm();
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "dailyRefresh") {
    // Tell every tab on *.claude.ai to run the refresh logic now
    chrome.tabs.query({ url: "*://*.claude.ai/*" }, tabs => {
      for (const tab of tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Dispatch a custom event that content.js listens for
            window.dispatchEvent(new Event("CLAUDE_USAGE_DAILY_REFRESH"));
          }
        });
      }
    });
    // Reschedule for the next day
    scheduleMidnightAlarm();
  }
});

/**
 * Schedules an alarm to fire at the next local midnight.
 * The alarm repeats daily via re‑scheduling after each fire.
 */
function scheduleMidnightAlarm() {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
  const minutesFromNow = (nextMidnight - now) / 1000 / 60;
  chrome.alarms.create("dailyRefresh", { delayInMinutes: minutesFromNow });
}
