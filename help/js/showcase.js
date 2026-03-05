(function () {
  "use strict";

  var isInApp = !!(window.webkit && window.webkit.messageHandlers);

  window.importPentan = function (p1Text) {
    if (isInApp && window.webkit.messageHandlers.importPentan) {
      window.webkit.messageHandlers.importPentan.postMessage(p1Text);
      showToast("Imported!");
    } else {
      copyToClipboard(p1Text);
    }
  };

  window.importGrid = function (g1Text) {
    if (isInApp && window.webkit.messageHandlers.importGrid) {
      window.webkit.messageHandlers.importGrid.postMessage(g1Text);
      showToast("Imported!");
    } else {
      copyToClipboard(g1Text);
    }
  };

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        showToast("Copied to clipboard!");
      });
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("Copied to clipboard!");
    }
  }

  function showToast(msg) {
    var existing = document.querySelector(".showcase-toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.className = "showcase-toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("fade-out");
      setTimeout(function () { toast.remove(); }, 300);
    }, 1500);
  }
})();
