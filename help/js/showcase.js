(function () {
  "use strict";

  var isInApp = !!(window.webkit && window.webkit.messageHandlers);

  // WKWebView does not support the `download` attribute on <a> tags.
  // Intercept clicks and trigger download via fetch + Blob URL, or via a
  // native message handler if the host app provides one.
  document.querySelectorAll("a.import-btn[download]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      // Native handler takes priority (host app can save directly to sandbox)
      if (isInApp && window.webkit.messageHandlers.downloadGrid) {
        e.preventDefault();
        // Pass the absolute URL so the native side can fetch it directly
        window.webkit.messageHandlers.downloadGrid.postMessage(link.href);
        return;
      }

      // In-app without a native handler: fetch the file and trigger a Blob download
      if (isInApp) {
        e.preventDefault();
        var href = link.href;
        var fileName = href.split("/").pop();
        fetch(href)
          .then(function (res) {
            if (!res.ok) throw new Error("fetch failed: " + res.status);
            return res.blob();
          })
          .then(function (blob) {
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () {
              URL.revokeObjectURL(url);
            }, 1000);
          })
          .catch(function (err) {
            console.error("Grid download failed:", err);
          });
      }
      // Normal browser: let the default `download` attribute handle it
    });
  });

  window.importPentan = function (arg) {
    if (isInApp && window.webkit.messageHandlers.importPentan) {
      // Inline P1 or relative path — native resolves paths like grid import
      window.webkit.messageHandlers.importPentan.postMessage(arg);
      showToast("Imported!");
      return;
    }
    if (arg.indexOf("P1:") === 0) {
      copyToClipboard(arg);
      return;
    }
    var url = new URL(arg, window.location.href);
    fetch(url.href)
      .then(function (res) {
        if (!res.ok) throw new Error("fetch failed: " + res.status);
        return res.text();
      })
      .then(function (text) {
        copyToClipboard(text.trim());
      })
      .catch(function (err) {
        console.error("Pentan load failed:", err);
      });
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
