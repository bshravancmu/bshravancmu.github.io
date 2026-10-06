// Breath pacer: one minute at about 5.5 breaths a minute, drawn as a chart.
(function () {
  const fig = document.querySelector('.breath');
  if (!fig) return;

  const DURATION = 60;              // seconds
  const PERIOD = 60 / 5.5;          // one breath, seconds
  const X0 = 40, X1 = 590;          // chart x range
  const Y_IN = 40, Y_OUT = 250;     // full inhale at top, full exhale at bottom
  const mid = (Y_IN + Y_OUT) / 2, amp = (Y_OUT - Y_IN) / 2;

  const xAt = (t) => X0 + (t / DURATION) * (X1 - X0);
  const yAt = (t) => mid + amp * Math.cos((2 * Math.PI * t) / PERIOD); // starts empty, rises first

  const pathTo = (tEnd) => {
    let d = `M${xAt(0).toFixed(1)} ${yAt(0).toFixed(1)}`;
    for (let t = 0.2; t <= tEnd; t += 0.2) d += ` L${xAt(t).toFixed(1)} ${yAt(t).toFixed(1)}`;
    return d;
  };

  const ghost = fig.querySelector('.wave-ghost');
  const done = fig.querySelector('.wave-done');
  const dot = fig.querySelector('.wave-dot');
  const btn = fig.querySelector('.breath-btn');
  const cue = fig.querySelector('.breath-cue');
  const clock = fig.querySelector('.breath-clock');

  ghost.setAttribute('d', pathTo(DURATION));

  let start = 0, raf = 0, lastPhase = '';
  const fmt = (s) => `00:${String(Math.floor(s)).padStart(2, '0')}`;

  const place = (t) => {
    dot.setAttribute('cx', xAt(t).toFixed(1));
    dot.setAttribute('cy', yAt(t).toFixed(1));
    done.setAttribute('d', t > 0 ? pathTo(t) : '');
    clock.textContent = `${t >= DURATION ? '01:00' : fmt(t)} / 01:00`;
  };

  const reset = (message) => {
    cancelAnimationFrame(raf);
    fig.classList.remove('breathing');
    btn.textContent = 'Breathe with the line';
    btn.setAttribute('aria-pressed', 'false');
    cue.textContent = message;
    lastPhase = '';
  };

  const tick = (now) => {
    const t = Math.min((now - start) / 1000, DURATION);
    place(t);
    const phase = (t % PERIOD) < PERIOD / 2 ? 'Breathe in' : 'Breathe out';
    if (phase !== lastPhase) { cue.textContent = phase; lastPhase = phase; }
    if (t < DURATION) raf = requestAnimationFrame(tick);
    else reset('Done. Notice how you feel.');
  };

  btn.addEventListener('click', () => {
    if (fig.classList.contains('breathing')) {
      reset('Paused. Press start to begin again.');
      place(0);
      return;
    }
    fig.classList.add('breathing');
    btn.textContent = 'Stop';
    btn.setAttribute('aria-pressed', 'true');
    start = performance.now();
    raf = requestAnimationFrame(tick);
  });

  place(0);
})();

// Copy the speaker bio.
document.querySelectorAll('.copy-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = document.getElementById(btn.dataset.copy).textContent.trim();
    const status = btn.parentElement.querySelector('.copy-status');
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Bio copied.';
    } catch {
      status.textContent = 'Copy blocked by the browser. Select the text above instead.';
    }
  });
});
