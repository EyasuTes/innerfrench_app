'use strict';
const rows = window.PASSAGES;
const $ = id => document.getElementById(id);
const audio = $('audio');
const storageKey = 'innerfrench-episode1-v1';
let active = -1, saved = {}, lastSave = 0;
try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
const format = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const cards = rows.map((row, i) => {
  const card = document.createElement('article');
  card.className = 'passage';
  const head = document.createElement('div'); head.className = 'passage-head';
  const jump = document.createElement('button'); jump.className = 'time'; jump.textContent = format(row.start);
  jump.setAttribute('aria-label', `Play passage ${i + 1} at ${format(row.start)}`);
  jump.addEventListener('click', () => seek(row.start, true));
  const label = document.createElement('span'); label.className = 'passage-label'; label.textContent = `PASSAGE ${String(i + 1).padStart(2, '0')}`;
  head.append(jump, label);
  const texts = document.createElement('div'); texts.className = 'texts';
  for (const lang of ['fr', 'en']) { const p = document.createElement('p'); p.lang = lang; p.className = lang; p.textContent = row[lang]; texts.append(p); }
  card.append(head, texts); $('passages').append(card); return card;
});
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify({time:audio.currentTime, speed:audio.playbackRate, english:$('english').checked, large:$('size').getAttribute('aria-pressed') === 'true', follow:$('follow').checked})); } catch {}
}
function reveal() { cards[Math.max(0, active)].scrollIntoView({block:'start', behavior:'auto'}); }
function update(force = false) {
  let index = 0;
  for (let i = 1; i < rows.length && rows[i].start <= audio.currentTime; i++) index = i;
  if (index !== active) {
    if (active >= 0) { cards[active].classList.remove('active'); cards[active].removeAttribute('aria-current'); }
    active = index; cards[active].classList.add('active'); cards[active].setAttribute('aria-current', 'true');
    $('position').textContent = `Passage ${active + 1} / ${rows.length}`;
    $('previous').disabled = active === 0; $('next').disabled = active === rows.length - 1;
    if ($('follow').checked && !audio.paused) reveal();
  }
  if (force && $('follow').checked) reveal();
}
async function seek(time, play = false) {
  audio.currentTime = Math.max(0, Math.min(time, Number.isFinite(audio.duration) ? audio.duration : time));
  update(true); save();
  if (play) { try { await audio.play(); } catch { $('status').textContent = 'Use the audio player’s play button to begin.'; } }
}
audio.addEventListener('timeupdate', () => {
  const end = active + 1 < rows.length ? rows[active + 1].start : audio.duration;
  if ($('loop').checked && !audio.paused && active >= 0 && audio.currentTime >= end) { audio.currentTime = rows[active].start; }
  update();
  if (Date.now() - lastSave > 2000) { save(); lastSave = Date.now(); }
});
audio.addEventListener('seeking', () => update());
audio.addEventListener('ended', () => { if ($('loop').checked) seek(rows[active].start, true); else { save(); $('status').textContent = 'Episode complete. Bien joué !'; } });
audio.addEventListener('play', () => { $('status').textContent = 'Listening · French and English follow the same passage.'; if ($('follow').checked) reveal(); });
audio.addEventListener('pause', save);
audio.addEventListener('error', () => { $('status').textContent = 'Audio could not load. Check that episode1.mp3 is in the same folder as this page.'; });
audio.addEventListener('loadedmetadata', () => {
  if (Number.isFinite(saved.time) && saved.time > 0 && saved.time < audio.duration - 2) { audio.currentTime = saved.time; update(); $('status').textContent = `Saved place: ${format(saved.time)}. Press play to continue.`; }
}, {once:true});
$('previous').onclick = () => seek(rows[Math.max(0, active - 1)].start, !audio.paused);
$('next').onclick = () => seek(rows[Math.min(rows.length - 1, active + 1)].start, !audio.paused);
$('back').onclick = () => seek(Math.max(0, audio.currentTime - 10));
$('current').onclick = reveal;
$('speed').onchange = () => { audio.playbackRate = Number($('speed').value); save(); };
$('follow').onchange = () => { if ($('follow').checked) reveal(); save(); };
$('english').onchange = () => { document.body.classList.toggle('hide-english', !$('english').checked); save(); };
$('size').onclick = () => { const large = $('size').getAttribute('aria-pressed') !== 'true'; $('size').setAttribute('aria-pressed', String(large)); document.body.classList.toggle('large', large); save(); };
if (typeof saved.english === 'boolean') $('english').checked = saved.english;
if (typeof saved.follow === 'boolean') $('follow').checked = saved.follow;
document.body.classList.toggle('hide-english', !$('english').checked);
document.body.classList.toggle('large', !!saved.large); $('size').setAttribute('aria-pressed', String(!!saved.large));
if ([0.65, 0.8, 1, 1.15, 1.25].includes(saved.speed)) { $('speed').value = saved.speed; audio.playbackRate = saved.speed; }
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
window.addEventListener('pagehide', save);
update();
