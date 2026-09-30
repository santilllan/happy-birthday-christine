// EDIT THIS: Put your friend's name here!
const FRIEND_NAME = "Christine";
const $ = (s) => document.querySelector(s);

$('#friendName').textContent = FRIEND_NAME;
$('#modalName').textContent = FRIEND_NAME + "!";
$('#year').textContent = new Date().getFullYear();

// ---------- Light background: few elements, no heavy anim ----------
(function initBackground() {
  const sparkleBox = $('#bgSparkles');
  const emojis = ['✨','⭐','💖'];
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.textContent = emojis[i % emojis.length];
    s.style.left = Math.random()*100 + 'vw';
    s.style.top = Math.random()*100 + 'vh';
    s.style.setProperty('--s', (10+Math.random()*10)+'px');
    s.style.animationDelay = (Math.random()*3)+'s';
    sparkleBox.appendChild(s);
  }
  const hearts = $('#heartsFloat');
  const hEmojis = ['💖','🌸','✨'];
  for (let i = 0; i < 7; i++) {
    const h = document.createElement('div');
    h.className = 'float-heart';
    h.textContent = hEmojis[i % hEmojis.length];
    h.style.left = (5 + Math.random()*90) + 'vw';
    h.style.setProperty('--s', (16+Math.random()*12)+'px');
    h.style.setProperty('--d', (11+Math.random()*7)+'s');
    h.style.setProperty('--delay', (Math.random()*12)+'s');
    hearts.appendChild(h);
  }
  const bBox = $('#balloonsBg');
  const colors = ['#ff6fa5','#a855f7','#ffb703','#7dd3fc'];
  for (let i = 0; i < 4; i++) {
    const b = document.createElement('div');
    b.className = 'bg-balloon';
    b.style.left = (8 + i*24 + Math.random()*8) + 'vw';
    b.style.background = colors[i % colors.length];
    b.style.setProperty('--d', (16+Math.random()*8)+'s');
    b.style.setProperty('--delay', (i*4)+'s');
    bBox.appendChild(b);
  }
})();

// ---------- Single canvas loop, only runs when needed ----------
const confettiCanvas = $('#confettiCanvas');
const fireworksCanvas = $('#fireworksCanvas');
const cCtx = confettiCanvas.getContext('2d');
const fCtx = fireworksCanvas.getContext('2d');
let confettiParticles = [];
let fireworks = [], fireParticles = [];
let loopRunning = false;

function resizeCanvases() {
  confettiCanvas.width = fireworksCanvas.width = window.innerWidth;
  confettiCanvas.height = fireworksCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

const CONFETTI_COLORS = ['#ff2e7e','#ff9ec6','#a855f7','#ffd66b','#7dd3fc','#ffffff'];

function popConfetti(count = 60, x = window.innerWidth/2, y = window.innerHeight/2) {
  // cap total to avoid lag
  if (confettiParticles.length > 350) confettiParticles.splice(0, confettiParticles.length - 350);
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x, y,
      vx: (Math.random()-0.5)*10,
      vy: Math.random()*-9 - 2,
      w: 5+Math.random()*6,
      h: 7+Math.random()*6,
      color: CONFETTI_COLORS[(Math.random()*CONFETTI_COLORS.length)|0],
      rot: Math.random()*6.28,
      vr: (Math.random()-0.5)*0.25,
      circle: Math.random() < 0.4,
      life: 1
    });
  }
  ensureLoop();
}
function launchFirework() {
  if (fireworks.length > 3) return;
  fireworks.push({
    x: Math.random()*fireworksCanvas.width*0.7 + fireworksCanvas.width*0.15,
    y: fireworksCanvas.height,
    targetY: fireworksCanvas.height*0.25 + Math.random()*fireworksCanvas.height*0.3,
    speed: 10,
    color: CONFETTI_COLORS[(Math.random()*CONFETTI_COLORS.length)|0]
  });
  ensureLoop();
}
function explode(x,y,color) {
  for (let i = 0; i < 28; i++) {
    const a = (Math.PI*2*i)/28;
    const sp = 2+Math.random()*3.5;
    fireParticles.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 1, color });
  }
}
function ensureLoop() {
  if (loopRunning) return;
  loopRunning = true;
  requestAnimationFrame(tick);
}
function tick() {
  const hasWork = confettiParticles.length || fireworks.length || fireParticles.length;
  if (!hasWork || document.hidden) {
    cCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
    fCtx.clearRect(0,0,fireworksCanvas.width,fireworksCanvas.height);
    loopRunning = false;
    return;
  }
  // confetti
  cCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
  confettiParticles = confettiParticles.filter(p => p.y < confettiCanvas.height+30 && p.life > 0);
  for (const p of confettiParticles) {
    p.vy += 0.3; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.008;
    cCtx.save(); cCtx.translate(p.x,p.y); cCtx.rotate(p.rot);
    cCtx.globalAlpha = p.life > 1 ? 1 : p.life;
    cCtx.fillStyle = p.color;
    if (p.circle) { cCtx.beginPath(); cCtx.arc(0,0,3.5,0,6.28); cCtx.fill(); }
    else cCtx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
    cCtx.restore();
  }
  // fireworks
  fCtx.clearRect(0,0,fireworksCanvas.width,fireworksCanvas.height);
  fireworks = fireworks.filter(f => f.y > f.targetY);
  for (const f of fireworks) {
    f.y -= f.speed;
    fCtx.fillStyle = f.color;
    fCtx.beginPath(); fCtx.arc(f.x,f.y,3,0,6.28); fCtx.fill();
    if (f.y <= f.targetY) explode(f.x,f.y,f.color);
  }
  fireParticles = fireParticles.filter(p => p.life > 0);
  for (const p of fireParticles) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life -= 0.02;
    fCtx.globalAlpha = p.life < 0 ? 0 : p.life;
    fCtx.fillStyle = p.color;
    fCtx.beginPath(); fCtx.arc(p.x,p.y,2.5,0,6.28); fCtx.fill();
  }
  fCtx.globalAlpha = 1;
  requestAnimationFrame(tick);
}

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>t.classList.remove('show'), 2500);
}

// ---------- Stage flow ----------
$('#giftWrap').addEventListener('click', () => {
  const wrap = $('#giftWrap');
  if (wrap.classList.contains('opening')) return;
  wrap.classList.add('opening');
  popConfetti(50, window.innerWidth/2, window.innerHeight/2);
  playPop();
  setTimeout(() => {
    popConfetti(100);
    launchFirework();
    $('#stageIntro').classList.remove('active');
    $('#stageMain').classList.add('active');
    window.scrollTo({top:0});
    startTypewriter();
    startMusic();
    toast(`Happy Birthday ${FRIEND_NAME}! 💖`);
  }, 600);
});

// ---------- Letter (fast type, no lag) ----------
const letterText = `Happy Birthday, Christine!\n\nIt's your special day, I hope you will enjoy this day.\n\nI'm really thankful that I met you when we first encountered each other on that socializing app. I honestly didn't expect that meeting you would lead to such a meaningful friendship we have now. It's already been a year of our friendship. I really appreciate it and more years to come.\n\nAlways remember that you're not alone in whatever battles or challenges you're facing. Me, your friends, and family are always here to support you. There are many people who care about you and will always be cheering for you.\n\nAgain, enjoy your day, Christine! You deserve all the happiness today and always. Happy Birthday! 🎂🎉`;
let typeStarted = false;
function startTypewriter() {
  if (typeStarted) return; typeStarted = true;
  const el = $('#typewriter'); let i = 0;
  (function type() {
    if (i <= letterText.length) {
      el.textContent = letterText.slice(0, i++);
      // show in chunks for speed
      if (i % 3 !== 0) { type(); return; }
      setTimeout(type, 18);
    }
  })();
}

// ---------- Candles ----------
function updateCakeHint() {
  const lit = document.querySelectorAll('.candle[data-lit="true"]').length;
  $('#cakeHint').textContent = lit === 0
    ? "✨ Yay! Wish sent to the stars!"
    : `Click the flames to blow out the candles (${lit} left)`;
}
document.querySelectorAll('.candle').forEach(c => {
  c.addEventListener('click', () => {
    if (c.dataset.lit !== "true") return;
    c.dataset.lit = "false";
    playBlow();
    const r = c.getBoundingClientRect();
    popConfetti(15, r.left, r.top);
    if (!document.querySelectorAll('.candle[data-lit="true"]').length) {
      popConfetti(120);
      launchFirework();
      toast("🌟 Wish locked in!");
    }
    updateCakeHint();
  });
});
$('#relightBtn').addEventListener('click', () => {
  document.querySelectorAll('.candle').forEach(c => c.dataset.lit = "true");
  updateCakeHint();
});
$('#confettiBtn').addEventListener('click', (e) => {
  popConfetti(80, e.clientX || window.innerWidth/2, e.clientY || window.innerHeight/2);
  playPop();
});
$('#wishBtn').addEventListener('click', () => {
  popConfetti(80); launchFirework();
  toast("🌟 Close your eyes and make a wish!");
});
$('#surpriseBtn').addEventListener('click', () => {
  $('#modalOverlay').classList.add('show');
  popConfetti(120); launchFirework();
  playMelody();
});
$('#celebrateBtn').addEventListener('click', () => {
  popConfetti(120); launchFirework();
  playMelody();
});
$('#closeModal').addEventListener('click', () => $('#modalOverlay').classList.remove('show'));
$('#modalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'modalOverlay') $('#modalOverlay').classList.remove('show');
});
updateCakeHint();

// ---------- Music ----------
let audioCtx = null, isPlaying = false;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function note(freq, start, dur, vol=0.18) {
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = 'triangle'; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start+0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, start+dur);
  o.connect(g).connect(audioCtx.destination);
  o.start(start); o.stop(start+dur+0.05);
}
function playPop() {
  try { ensureAudio(); note(880, audioCtx.currentTime, 0.2); } catch(e){}
}
function playBlow() {
  try {
    ensureAudio();
    const len = audioCtx.sampleRate*0.2;
    const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buffer.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * (1-i/len) * 0.2;
    const src = audioCtx.createBufferSource(); src.buffer = buffer;
    src.connect(audioCtx.destination); src.start();
  } catch(e){}
}
function playMelody() {
  try {
    ensureAudio();
    const t = audioCtx.currentTime + 0.05;
    const seq = [
      [392,0,.35],[392,.4,.35],[440,.8,.5],[392,1.35,.5],[523,1.9,.7],[494,2.7,.8],
      [392,3.6,.35],[392,4.0,.35],[440,4.4,.5],[392,5.0,.5],[587,5.6,.7],[523,6.4,.9],
      [392,7.4,.35],[392,7.8,.35],[784,8.2,.6],[659,8.9,.5],[523,9.5,.5],[494,10.0,.5],[440,10.6,.7]
    ];
    seq.forEach(([f,off,d]) => note(f, t+off, d));
  } catch(e){}
}
function startMusic() {
  if (isPlaying) return;
  $('#musicBtn').classList.add('playing');
  $('#musicBtn').textContent = '🎶';
  isPlaying = true; playMelody();
}
$('#musicBtn').addEventListener('click', () => {
  ensureAudio();
  isPlaying = !isPlaying;
  $('#musicBtn').classList.toggle('playing', isPlaying);
  $('#musicBtn').textContent = isPlaying ? '🎶' : '🎵';
  if (isPlaying) playMelody();
});
