/**
 * Wait for 'network idle' in the page:
 * - No new fetch/XHR/resource events for `idleTimeout` ms.
 * - OR `maxWait` ms has passed overall, whichever comes first.
 *
 * @param {Object} options
 * @param {number} options.idleTimeout - How many ms of quiet to wait before considering the network "idle" (default 2000).
 * @param {number} options.maxWait - Maximum ms to wait in total before giving up (default 10000).
 * @returns {Promise<void>} Resolves once idle or maxWait is reached.
 */
const waitForIdle = ({ idleTimeout = 2000, maxWait = 10000 } = {}) => {
  return new Promise((resolve) => {
    let idleTimer = null;
    let maxTimer = null;
    let finished = false;

    function finalize() {
      if (finished) return;
      finished = true;

      clearTimeout(idleTimer);
      clearTimeout(maxTimer);

      // Disconnect PerformanceObserver if we used it
      if (observer && typeof observer.disconnect === "function") {
        observer.disconnect();
      }

      // Restore the original fetch, if desired
      if (originalFetch) {
        window.fetch = originalFetch;
      }

      // Restore the original XHR open, if desired
      if (originalXHROpen) {
        XMLHttpRequest.prototype.open = originalXHROpen;
      }

      resolve();
    }

    // --- Idle timer logic ---
    function resetIdleTimer() {
      if (finished) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        // If we go idleTimeout ms with no new requests, consider ourselves idle
        finalize();
      }, idleTimeout);
    }

    // --- Observe resource loading with PerformanceObserver ---
    let observer;
    if ("PerformanceObserver" in window) {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "resource") {
            resetIdleTimer();
          }
        }
      });
      // Observe newly added resource entries
      observer.observe({ type: "resource", buffered: true });
    }

    // --- Monkey-patch fetch ---
    let originalFetch = null;
    if (window.fetch) {
      originalFetch = window.fetch;
      window.fetch = async function (...args) {
        resetIdleTimer(); // starting a fetch
        try {
          const response = await originalFetch.apply(this, args);
          resetIdleTimer(); // fetch finished
          return response;
        } catch (err) {
          resetIdleTimer(); // fetch error
          throw err;
        }
      };
    }

    // --- Monkey-patch XHR ---
    let originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (...args) {
      // On XHR success or error, reset idle timer
      this.addEventListener("load", resetIdleTimer, false);
      this.addEventListener("error", resetIdleTimer, false);

      resetIdleTimer(); // starting an XHR
      return originalXHROpen.apply(this, args);
    };

    //  Maximum overall wait
    maxTimer = setTimeout(() => {
      if (!finished) {
        console.warn(`waitForIdle timed out after ${maxWait}ms; proceeding.`);
        finalize();
      }
    }, maxWait);

    // Kick things off
    resetIdleTimer();
  });
};

export { waitForIdle };
