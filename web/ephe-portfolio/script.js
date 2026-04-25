// ===== LOADING SCREEN =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelector('.loader').classList.add('hidden');
  }, 1200);
});

// ===== NAVBAR SCROLL =====
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE MENU =====
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  const spans = menuToggle.querySelectorAll('span');
  if (navLinks.classList.contains('active')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
});

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    const spans = menuToggle.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  });
});

// ===== CURSOR GLOW =====
const cursorGlow = document.querySelector('.cursor-glow');
document.addEventListener('mousemove', e => {
  if (cursorGlow) {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  }
});

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ===== VISION CARDS MOUSE TRACKING =====
document.querySelectorAll('.vision-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

// ===== FETCH GITHUB REPOS =====
const GITHUB_USERNAME = 'devolopereph';
const projectsContainer = document.getElementById('projects-container');

const langColors = {
  'Dart': '#00B4AB',
  'Python': '#3572A5',
  'JavaScript': '#F1E05A',
  'TypeScript': '#3178C6',
  'HTML': '#E34C26',
  'CSS': '#563D7C',
  'C++': '#F34B7D',
  'Java': '#B07219',
  'Kotlin': '#A97BFF',
  'Swift': '#F05138',
  'null': '#888888'
};

async function fetchRepos() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20`);
    const repos = await res.json();

    const filtered = repos.filter(r => !r.fork && r.name !== GITHUB_USERNAME);

    if (filtered.length === 0) {
      projectsContainer.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">Henüz public proje yok.</p>';
      return;
    }

    projectsContainer.innerHTML = filtered.map(repo => {
      const lang = repo.language || 'null';
      const color = langColors[lang] || '#888';
      const desc = repo.description || 'Açıklama eklenmemiş.';
      const topics = repo.topics || [];
      const stars = repo.stargazers_count;
      const forks = repo.forks_count;
      const updatedDate = new Date(repo.updated_at).toLocaleDateString('tr-TR', {
        year: 'numeric', month: 'short', day: 'numeric'
      });

      return `
        <div class="project-card reveal">
          <div class="project-card-header">
            <span class="folder-icon">📂</span>
            <div class="project-card-links">
              <a href="${repo.html_url}" target="_blank" rel="noopener" title="GitHub'da Aç">↗</a>
            </div>
          </div>
          <h3>${repo.name}</h3>
          <p class="description">${desc}</p>
          ${topics.length > 0 ? `
            <div class="tags">
              ${topics.slice(0, 5).map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
          ` : ''}
          <div class="meta">
            <span><span class="lang-dot" style="background:${color}"></span> ${lang !== 'null' ? lang : '—'}</span>
            <span>⭐ ${stars}</span>
            <span>🍴 ${forks}</span>
            <span>📅 ${updatedDate}</span>
          </div>
        </div>
      `;
    }).join('');

    // Re-observe new elements
    document.querySelectorAll('.project-card.reveal').forEach(el => {
      revealObserver.observe(el);
    });

  } catch (err) {
    console.error('GitHub API hatası:', err);
    projectsContainer.innerHTML = `
      <p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">
        Projeler yüklenirken hata oluştu. Lütfen sayfayı yenileyin.
      </p>`;
  }
}

fetchRepos();

// ===== ARCHERY INTERACTIVE GAME =====
const archeryCanvas = document.getElementById('archery-canvas');
const hitCounterEl = document.getElementById('hit-counter');

if (archeryCanvas) {
  const ctx = archeryCanvas.getContext('2d');
  let hits = 0;
  const arrows = [];
  let animId;

  function resizeCanvas() {
    const parent = archeryCanvas.parentElement;
    archeryCanvas.width = parent.clientWidth;
    archeryCanvas.height = parent.clientHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Draw target
  function drawTarget(cx, cy) {
    const rings = [60, 48, 36, 24, 12];
    const colors = ['#1a1a1a', '#222', '#2a2a2a', '#333', '#c81830'];
    rings.forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  // Arrow class
  class Arrow {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.opacity = 1;
      this.scale = 0;
      this.life = 120;
    }
    update() {
      this.scale = Math.min(this.scale + 0.15, 1);
      this.life--;
      if (this.life < 30) this.opacity = this.life / 30;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);

      // Arrow shaft
      ctx.strokeStyle = '#f5f5f5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 18);
      ctx.stroke();

      // Arrowhead
      ctx.fillStyle = '#f5f5f5';
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(-5, -14);
      ctx.lineTo(5, -14);
      ctx.closePath();
      ctx.fill();

      // Fletching
      ctx.strokeStyle = 'rgba(200, 24, 48, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, 14);
      ctx.lineTo(0, 18);
      ctx.lineTo(4, 14);
      ctx.stroke();

      // Impact ring
      ctx.beginPath();
      ctx.arc(0, 0, 8 * this.scale, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.3 * this.opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  const targetX = () => archeryCanvas.width / 2;
  const targetY = () => archeryCanvas.height / 2;

  function animate() {
    ctx.clearRect(0, 0, archeryCanvas.width, archeryCanvas.height);

    drawTarget(targetX(), targetY());

    arrows.forEach(a => { a.update(); a.draw(); });
    // remove dead
    for (let i = arrows.length - 1; i >= 0; i--) {
      if (arrows[i].life <= 0) arrows.splice(i, 1);
    }

    animId = requestAnimationFrame(animate);
  }

  animate();

  archeryCanvas.parentElement.addEventListener('click', e => {
    const rect = archeryCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    arrows.push(new Arrow(x, y));

    // Check if hit target center
    const dx = x - targetX();
    const dy = y - targetY();
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 60) {
      hits++;
      hitCounterEl.textContent = hits;
      // Bullseye effect
      if (dist < 12) {
        hitCounterEl.style.color = 'var(--accent-red)';
        setTimeout(() => hitCounterEl.style.color = 'var(--text-primary)', 500);
      }
    }
  });
}

// ===== TYPING EFFECT FOR MOTTO =====
const mottoEl = document.querySelector('.motto-typed');
if (mottoEl) {
  const text = mottoEl.dataset.text;
  mottoEl.textContent = '';
  let i = 0;
  function typeMotto() {
    if (i < text.length) {
      mottoEl.textContent += text[i];
      i++;
      setTimeout(typeMotto, 60);
    }
  }

  const mottoObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      typeMotto();
      mottoObserver.disconnect();
    }
  }, { threshold: 0.5 });

  mottoObserver.observe(mottoEl);
}
