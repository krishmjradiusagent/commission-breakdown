/* Shared Mel voice FAB — hold to talk, tap for HUD, double-tap for chat. Mirrors Implemented Home.html. */
(function () {
  var melOrb = document.getElementById('melOrb');
  if (!melOrb) return;
  var muted = false, holdTimer = null, held = false, speakTimer = null, lastTap = 0;
  var melHud = document.getElementById('melHud'), melHudLabel = document.getElementById('melHudLabel');
  var toast = document.getElementById('toast'), toastTimer = null;
  var melChatView = document.getElementById('melChatView');

  function say(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  function setMode(mode, chain) {
    clearTimeout(speakTimer);
    melOrb.classList.remove('idle', 'listening', 'thinking', 'speaking', 'muted');
    melOrb.classList.add(mode);
    if (mode === 'listening') { melHudLabel.textContent = 'Listening…'; melOrb.setAttribute('aria-label', 'Listening — tap to stop'); melHud.classList.add('show'); if (toast) toast.classList.remove('show'); }
    else if (mode === 'thinking') {
      melHudLabel.textContent = 'Thinking…'; melOrb.setAttribute('aria-label', 'Mel is thinking'); melHud.classList.add('show');
      if (chain) { speakTimer = setTimeout(function () { setMode('speaking', true); }, 1400); }
    }
    else if (mode === 'speaking') {
      melHudLabel.textContent = 'Speaking…'; melOrb.setAttribute('aria-label', 'Speaking — tap to stop'); melHud.classList.add('show');
      if (chain) { speakTimer = setTimeout(function () { setMode('idle'); }, 4200); }
    }
    else if (mode === 'idle') { melOrb.setAttribute('aria-label', 'Talk to Mel — hold to speak'); melHud.classList.remove('show'); }
    else if (mode === 'muted') { melHudLabel.textContent = 'Mic muted'; melOrb.setAttribute('aria-label', 'Mic muted — unmute to talk to Mel'); melHud.classList.add('show'); }
  }

  function startHold() {
    if (muted) return;
    held = false; melOrb.classList.add('arming');
    holdTimer = setTimeout(function () { held = true; melOrb.classList.remove('arming'); setMode('listening'); }, 350);
  }
  function openChat() { if (melChatView) melChatView.classList.add('open'); }
  function closeChat() { if (melChatView) melChatView.classList.remove('open'); }
  function endHold() {
    clearTimeout(holdTimer); melOrb.classList.remove('arming');
    if (muted) { melHud.classList.add('show'); return; }
    if (held) { return; }
    if (melOrb.classList.contains('listening')) { setMode('thinking', true); lastTap = 0; return; }
    if (melOrb.classList.contains('thinking')) { setMode('idle'); lastTap = 0; return; }
    if (melOrb.classList.contains('speaking')) { setMode('idle'); lastTap = 0; return; }
    var now = Date.now();
    if (now - lastTap < 320) { lastTap = 0; openChat(); return; }
    lastTap = now;
    say('Opens Mel — voice & chat · double-tap to ask');
  }
  melOrb.addEventListener('touchstart', startHold, { passive: true });
  melOrb.addEventListener('touchend', endHold);
  melOrb.addEventListener('mousedown', startHold);
  melOrb.addEventListener('mouseup', endHold);
  melOrb.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  var melChatBtn = document.getElementById('melChatBtn');
  if (melChatBtn) melChatBtn.addEventListener('click', openChat);
  var melChatClose = document.getElementById('melChatClose');
  if (melChatClose) melChatClose.addEventListener('click', closeChat);

  var melMute = document.getElementById('melMute');
  if (melMute) melMute.addEventListener('click', function () {
    muted = !muted; melMute.setAttribute('aria-pressed', muted ? 'true' : 'false');
    setMode(muted ? 'muted' : 'idle');
  });

  [].forEach.call(document.querySelectorAll('.mc-send'), function (b) {
    b.addEventListener('click', function () { var t = b.getAttribute('data-toast'); if (t) say(t); });
  });

  setMode('idle');
})();
