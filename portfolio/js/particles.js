/**
 * HIGH-PERFORMANCE INTERACTIVE CANVAS PARTICLE ENGINE
 * Built with vanilla JavaScript for rendering fluid mathematical structures.
 */

(function () {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId = null;

    // Global configuration connected to UI controls
    window.ParticleEngineConfig = {
        density: 80,
        speedMultiplier: 1.2,
        themeColor: '#a855f7', // Hex value mapped to primary theme color
        connectDistance: 110,
        mouseRepelRadius: 150,
        mouseRepelForce: 0.8
    };

    // Tracking mouse state
    const mouse = {
        x: null,
        y: null,
        radius: window.ParticleEngineConfig.mouseRepelRadius,
        clicks: []
    };

    // Track mouse move on screen
    window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Clear mouse position when it leaves window
    window.addEventListener('mouseout', function () {
        mouse.x = null;
        mouse.y = null;
    });

    // Create a click ripple effect
    window.addEventListener('click', function (e) {
        mouse.clicks.push({
            x: e.clientX,
            y: e.clientY,
            radius: 10,
            maxRadius: 180,
            speed: 5
        });
    });

    // Scale canvas properly for High-DPI screens
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        // Re-initialize particles to fit the new size
        initParticles();
    }

    window.addEventListener('resize', debounce(resizeCanvas, 150));

    // Helper for debouncing resize
    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Particle Object Definition
    class Particle {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.reset();
        }

        reset() {
            this.x = Math.random() * this.width;
            this.y = Math.random() * this.height;
            this.radius = Math.random() * 2 + 1; // 1px to 3px
            
            // Random direction vectors
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.4 + 0.1;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            
            // Base speed multipliers
            this.baseVx = this.vx;
            this.baseVy = this.vy;

            // Ambient breathing/opacity oscillation
            this.alpha = Math.random() * 0.4 + 0.15;
            this.alphaSpeed = Math.random() * 0.01 + 0.005;
            this.alphaDirection = Math.random() > 0.5 ? 1 : -1;
        }

        update(w, h) {
            const config = window.ParticleEngineConfig;
            
            // Update boundaries if they changed
            this.width = w;
            this.height = h;

            // Opacity breath
            this.alpha += this.alphaSpeed * this.alphaDirection;
            if (this.alpha > 0.65 || this.alpha < 0.1) {
                this.alphaDirection *= -1;
            }

            // Normal drifting movement with dynamic UI speedMultiplier
            this.vx = this.baseVx * config.speedMultiplier;
            this.vy = this.baseVy * config.speedMultiplier;

            // Push particles away from cursor
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < config.mouseRepelRadius) {
                    const force = (config.mouseRepelRadius - dist) / config.mouseRepelRadius;
                    // Vector direction away from mouse
                    const forceX = (dx / dist) * force * config.mouseRepelForce;
                    const forceY = (dy / dist) * force * config.mouseRepelForce;
                    
                    this.vx += forceX;
                    this.vy += forceY;
                }
            }

            // Handle active click ripple effects pushing particles
            for (let i = mouse.clicks.length - 1; i >= 0; i--) {
                const click = mouse.clicks[i];
                const dx = this.x - click.x;
                const dy = this.y - click.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (Math.abs(dist - click.radius) < 20) {
                    const pushForce = 3.5;
                    this.vx += (dx / dist) * pushForce;
                    this.vy += (dy / dist) * pushForce;
                }
            }

            // Move particle
            this.x += this.vx;
            this.y += this.vy;

            // Boundary wrapping with fresh velocities
            if (this.x < 0 || this.x > this.width || this.y < 0 || this.y > this.height) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(window.ParticleEngineConfig.themeColor, this.alpha);
            ctx.fill();
        }
    }

    // Initialize the particle system
    function initParticles() {
        const config = window.ParticleEngineConfig;
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        particles = [];
        for (let i = 0; i < config.density; i++) {
            particles.push(new Particle(w, h));
        }
    }

    // Convert hex color to rgba for drawing transparent connections
    function hexToRgba(hex, alpha) {
        hex = hex.replace('#', '');
        let r, g, b;
        if (hex.length === 3) {
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
        } else {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Particle Animation Loop
    function animate() {
        const config = window.ParticleEngineConfig;
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        ctx.clearRect(0, 0, w, h);

        // Update click ripples
        for (let i = mouse.clicks.length - 1; i >= 0; i--) {
            const click = mouse.clicks[i];
            click.radius += click.speed;
            
            // Draw visual ripple wave
            ctx.beginPath();
            ctx.arc(click.x, click.y, click.radius, 0, Math.PI * 2);
            const ripAlpha = 1 - (click.radius / click.maxRadius);
            ctx.strokeStyle = hexToRgba(config.themeColor, ripAlpha * 0.2);
            ctx.lineWidth = 2;
            ctx.stroke();

            if (click.radius >= click.maxRadius) {
                mouse.clicks.splice(i, 1);
            }
        }

        // Draw connections first (so particles layer on top)
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < config.connectDistance) {
                    const alpha = (1 - (dist / config.connectDistance)) * 0.14;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = hexToRgba(config.themeColor, alpha);
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.update(w, h);
            p.draw();
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Public controller hook for density updates
    window.updateParticleDensity = function (newDensity) {
        const config = window.ParticleEngineConfig;
        config.density = parseInt(newDensity);
        
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        if (particles.length < config.density) {
            // Add particles
            const diff = config.density - particles.length;
            for (let i = 0; i < diff; i++) {
                particles.push(new Particle(w, h));
            }
        } else if (particles.length > config.density) {
            // Remove extra particles
            particles.splice(config.density);
        }
    };

    // Initial launch
    resizeCanvas();
    animate();

})();
