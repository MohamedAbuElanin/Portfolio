document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       1. Mobile Menu
    ================================ */
    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", () => {
            mainNav.classList.toggle("nav-active");

            const expanded = mainNav.classList.contains("nav-active");
            menuToggle.setAttribute("aria-expanded", expanded);
        });
    }


    /* ===============================
       2. Theme Toggle (Neon Mode)
    ================================ */
    /* ===============================
       2. Theme Toggle (Neon Mode) & Sound
    ================================ */
    const themeBtn = document.getElementById("theme-toggle");
    const html = document.documentElement;
    
    // Themes: dark -> green -> purple -> light -> dark
    const themes = ["dark", "green", "purple", "light"];
    
    const savedTheme = localStorage.getItem("theme") || "dark";
    html.setAttribute("data-theme", savedTheme);

    // Audio Context (created on first interaction)
    let audioCtx;
    let isMuted = false;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playSound(type) {
        if (isMuted || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        
        if (type === 'hover') {
            // High pitch short blip
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'click') {
            // Mechanical switch click
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            initAudio();
            playSound('click');

            const current = html.getAttribute("data-theme");
            let nextIndex = (themes.indexOf(current) + 1) % themes.length;
            const newTheme = themes[nextIndex];

            html.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);

            neonFlash();
        });
        
        // Add Sound Toggle to Theme Button (Long Press or Double Click? 
        // User asked for a Mute button. Let's add it to the header or use the theme button context)
        // For now, let's keep it simple: Sound on by default, no visible mute button yet unless requested.
        // User asked: "Optional + زرار mute"
    }

    // Attach hover sounds
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, .proj-card, .glass-card')) {
            initAudio();
            playSound('hover');
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) {
            initAudio();
            playSound('click');
        }
    });


    /* ===============================
       3. Scroll Reveal Animation
    ================================ */

    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("neon-show");
                observer.unobserve(entry.target);
            }

        });

    }, observerOptions);


    const elements = document.querySelectorAll(
        ".item, .proj-card, .skill-group, .bio, section"
    );

    elements.forEach(el => {
        el.classList.add("neon-hide");
        observer.observe(el);
    });


    /* ===============================
       4. Typing Effect (Hero Text)
    ================================ */

    /* ===============================
       4. Typing Effect (Hero Text)
    ================================ */

    const typingText = document.querySelector(".typing");

    if (typingText) {
        const textStr = typingText.dataset.text; // "Hi, I'm ... | ..."
        let charIndex = 0;
        let isDeleting = false;

        function typeLoop() {
            const currentString = textStr;
            
            if (isDeleting) {
                typingText.textContent = currentString.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingText.textContent = currentString.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 40 : 80;

            if (!isDeleting && charIndex === currentString.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                typeSpeed = 500; // Pause before incrementing
            }

            setTimeout(typeLoop, typeSpeed);
        }

        typeLoop();
    }


    /* ===============================
       5. Advanced Neon Cursor Effect
    ================================ */

    const cursor = document.createElement("div");
    cursor.classList.add("neon-cursor");
    document.body.appendChild(cursor);

    // Create tail elements
    const tailCount = 12;
    const tails = [];
    for(let i=0; i<tailCount; i++) {
        const tail = document.createElement("div");
        tail.classList.add("cursor-tail");
        document.body.appendChild(tail);
        tails.push({
            el: tail,
            x: 0,
            y: 0
        });
    }

    document.addEventListener("mousemove", (e) => {
        // Main cursor
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
        
        // Update tails with delay
        tails.forEach((tail, index) => {
            setTimeout(() => {
                tail.el.style.left = e.clientX + "px";
                tail.el.style.top = e.clientY + "px";
                tail.el.style.opacity = 1 - (index / tailCount);
                tail.el.style.transform = `scale(${1 - (index / tailCount)})`;
            }, index * 15);
        });
    });


    /* ===============================
       6. Button Hover Sound Effect (Optional)
    ================================ */

    const buttons = document.querySelectorAll("button, .btn, a");

    buttons.forEach(btn => {

        btn.addEventListener("mouseenter", () => {
            btn.classList.add("hover-glow");
        });

        btn.addEventListener("mouseleave", () => {
            btn.classList.remove("hover-glow");
        });

    });


    /* ===============================
       7. Page Load Animation
    ================================ */

    document.body.classList.add("page-loaded");


    /* ===============================
       Helper: Neon Flash
    ================================ */

    function neonFlash() {

        document.body.classList.add("neon-flash");

        setTimeout(() => {
            document.body.classList.remove("neon-flash");
        }, 300);

    }

    /* ===============================
       8. Matrix Rain Effect (Hero)
    ================================ */
    const matrixCanvas = document.getElementById("matrix-canvas");
    if (matrixCanvas) {
        const ctx = matrixCanvas.getContext("2d");
        
        let width = matrixCanvas.width = window.innerWidth;
        let height = matrixCanvas.height = window.innerHeight;
        
        const chars = "0123456789ABCDEF日本語アィイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン".split("");
        const fontSize = 16;
        const columns = width / fontSize;
        const drops = [];
        
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
        
        function drawMatrix() {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = "#0aff0a"; // Neon Green
            ctx.font = fontSize + "px monospace";
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        setInterval(drawMatrix, 33);
        
        window.addEventListener("resize", () => {
            width = matrixCanvas.width = window.innerWidth;
            height = matrixCanvas.height = window.innerHeight;
        });
    }

    /* ===============================
       9. Particles Background
    ================================ */
    const particlesCanvas = document.getElementById("particles-canvas");
    if (particlesCanvas) {
        const ctx = particlesCanvas.getContext("2d");
        let width = particlesCanvas.width = window.innerWidth;
        let height = particlesCanvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 50; 
        
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0, 243, 255, 0.2)"; // Neon Blue
                ctx.fill();
            }
        }
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach((p, index) => {
                p.update();
                p.draw();
                
                // Draw connections
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 243, 255, ${1 - dist / 100})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            
            requestAnimationFrame(animateParticles);
        }
        
        animateParticles();
        
        window.addEventListener("resize", () => {
            width = particlesCanvas.width = window.innerWidth;
            height = particlesCanvas.height = window.innerHeight;
        });
    }

    /* ===============================
       10. 3D Tilt Effect
    ================================ */
    const tiltCards = document.querySelectorAll('.glass-card, .proj-card, .s, .tilt-item');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angleX = (centerY - y) / 10;
            const angleY = (x - centerX) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    /* ===============================
       11. Animated Skill Bars
    ================================ */
    const skillBars = document.querySelectorAll('.fill');
    
    skillBars.forEach(bar => {
        const width = bar.style.width;
        bar.dataset.width = width; 
        bar.style.width = "0";
    });

    const skillObserver2 = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                bar.style.width = bar.dataset.width;
                skillObserver2.unobserve(bar);
            }
        });
    }, { threshold: 0.2 });

    skillBars.forEach(bar => {
        skillObserver2.observe(bar);
    });

    /* ===============================
       12. Animated & Dynamic Stats Counter
    ================================ */
    const stats = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.stats');

    // Make Experience "Real"
    const expStat = document.getElementById('exp-stat');
    if (expStat) {
        const startDate = new Date('2023-11-01'); // Assuming start of journey
        const today = new Date();
        const diffYears = (today - startDate) / (1000 * 60 * 60 * 24 * 365.25);
        const realExp = diffYears.toFixed(1);
        expStat.dataset.target = realExp;
    }

    function runCounter(stat) {
        const target = parseFloat(stat.dataset.target);
        stat.innerText = "0";
        
        let current = 0;
        const duration = 1500; // 1.5s
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.innerText = target + (target % 1 === 0 ? "+" : "");
                clearInterval(timer);
            } else {
                stat.innerText = target % 1 === 0 ? Math.floor(current) : current.toFixed(1);
            }
        }, stepTime);
    }

    if (statsSection && stats.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    stats.forEach(runCounter);
                    observer.unobserve(statsSection);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);

        // Click to recount
        document.querySelectorAll('.stat-item').forEach(item => {
            item.addEventListener('click', () => {
                initAudio();
                playSound('click');
                const stat = item.querySelector('.stat-number');
                if (stat) runCounter(stat);
            });
        });
    }

    /* ===============================
       13. GitHub Repos Integration
    ================================ */
    const githubContainer = document.getElementById("github-repos-container");
    const githubUsername = "MohamedAbuElanin";

    async function fetchGitHubRepos() {
        if (!githubContainer) return;

        try {
            const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`);
            if (!response.ok) throw new Error("Failed to fetch repos");
            
            const repos = await response.json();
            renderRepos(repos);
        } catch (error) {
            console.error(error);
            githubContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--neon-purple);">Error loading repositories. Please visit <a href="https://github.com/${githubUsername}" target="_blank">GitHub</a>.</p>`;
        }
    }

    function renderRepos(repos) {
        githubContainer.innerHTML = ""; // Clear loader

        repos.forEach(repo => {
            if (repo.fork) return; // Skip forks

            const card = document.createElement("article");
            card.classList.add("proj-card", "glass-card", "tilt-item");
            
            card.innerHTML = `
                <div class="proj-img-wrap" style="height: 120px; background: linear-gradient(135deg, rgba(0, 243, 255, 0.1), rgba(188, 19, 254, 0.1)); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <i class="fab fa-github" style="font-size: 60px; color: var(--neon-blue); opacity: 0.3;"></i>
                </div>
                <div class="proj-content">
                    <h4 style="margin-bottom: 5px; font-size: 18px;">${repo.name}</h4>
                    <p style="font-size: 13px; line-height: 1.4; margin-bottom: 15px;">${repo.description || "No description provided."}</p>
                    <div class="tech-stack" style="margin-bottom: 15px;">
                        <span class="ai-badge" style="font-size: 10px; padding: 2px 8px;">${repo.language || "Link"}</span>
                    </div>
                    <div class="btn-group">
                        <a class="btn small primary" href="${repo.html_url}" target="_blank">Repo <i class="fab fa-github"></i></a>
                        ${repo.homepage ? `<a class="btn small" href="${repo.homepage}" target="_blank">Live Demo <i class="fas fa-external-link-alt"></i></a>` : ""}
                    </div>
                </div>
            `;

            githubContainer.appendChild(card);
            
            // Add tilt to dynamic card
            addTilt(card);
        });
    }

    function addTilt(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const angleX = (centerY - y) / 15;
            const angleY = (x - centerX) / 15;
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    }

    // Call fetch when GitHub tab is clicked (or once on load if needed)
    const githubTab = document.getElementById("tab-github");
    if (githubTab) {
        githubTab.addEventListener("change", () => {
            if (githubContainer.querySelector(".loading-message")) {
                fetchGitHubRepos();
            }
        });
    }

});
