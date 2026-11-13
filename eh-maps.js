/* Engineers Horizon — Google Maps helper.
   Each map box holds a live Google Maps embed (iframe[data-eh-map]) on top of
   a styled location card that links to Google Maps. If the browser blocks the
   embed (as previews and some sandboxes do), the embed is hidden so the card
   underneath shows instead. On the live website the real map shows. */
(function () {
  var flagged = false;
  function useCards() {
    if (flagged) return;
    flagged = true;
    var s = document.createElement('style');
    s.textContent = 'iframe[data-eh-map]{display:none !important}';
    (document.head || document.documentElement).appendChild(s);
  }
  document.addEventListener('securitypolicyviolation', function (e) {
    var uri = String(e.blockedURI || '');
    var dir = String(e.violatedDirective || e.effectiveDirective || '');
    if (/google\./i.test(uri) || /^(frame|child)-src/.test(dir)) useCards();
  });
})();
