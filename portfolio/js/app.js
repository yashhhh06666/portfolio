/**
 * ALEX RIVERA PORTFOLIO CORE APPLICATION ENGINE
 * Coordinates theme variable swaps, custom cursor interpolation, typewriter rotations,
 * magnetic physics overlays, intersection observers, and project details modal injection.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* ==========================================================================
       1. LINEAR INTERPOLATED (LERP) CUSTOM CURSOR TRACKING
       ========================================================================== */
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');
    
    if (cursor && cursorDot) {
        let mouseX = 0, mouseY = 0; // Target coordinates
        let cursorX = 0, cursorY = 0; // Interpolated coordinates
        
        // Track absolute mouse positions
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Dot follows cursor immediately
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });
        
        // Inertia tracking animation loop
        function animateCursor() {
            // LERP equation: current = current + (target - current) * factor
            cursorX += (mouseX - cursorX) * 0.16;
            cursorY += (mouseY - cursorY) * 0.16;
            
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
        
        // Handle Hover states
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, .project-card, .theme-opt');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover');
            });
        });
    }

    /* ==========================================================================
       2. DYNAMIC MULTI-PHRASE TYPEWRITER ROUTINE
       ========================================================================== */
    const typeTarget = document.getElementById('typing-target');
    if (typeTarget) {
        const phrases = [
            "Digital Spaces.",
            "High-Performance Frontends.",
            "Scalable Architectures.",
            "Creative Interfaces."
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;
        
        function handleTypewriter() {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                // Delete character
                typeTarget.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50; // Deletes faster
            } else {
                // Type character
                typeTarget.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 120; // Normal typing speed
            }
            
            // Handle phrase completion
            if (!isDeleting && charIndex === currentPhrase.length) {
                // Pause at complete phrase
                typingSpeed = 2200;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 400; // Pause before typing next phrase
            }
            
            setTimeout(handleTypewriter, typingSpeed);
        }
        
        // Start after brief delay
        setTimeout(handleTypewriter, 1000);
    }

    /* ==========================================================================
       3. AMBIENT THEME SELECTOR & DENSITY SYNC
       ========================================================================== */
    const themePanel = document.getElementById('theme-panel');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const themeOpts = document.querySelectorAll('.theme-opt');
    
    // Theme HEX map for Canvas sync
    const themeColors = {
        cyberpunk: '#a855f7',
        aurora: '#10b981',
        sunset: '#f97316',
        ocean: '#06b6d4'
    };

    // Toggle customizer sidebar
    if (themeToggleBtn && themePanel) {
        themeToggleBtn.addEventListener('click', () => {
            themePanel.classList.toggle('active');
        });
    }
    
    if (closePanelBtn && themePanel) {
        closePanelBtn.addEventListener('click', () => {
            themePanel.classList.remove('active');
        });
    }

    // Close panel on clicking outside
    document.addEventListener('click', (e) => {
        if (themePanel && themePanel.classList.contains('active')) {
            if (!themePanel.contains(e.target) && !themeToggleBtn.contains(e.target)) {
                themePanel.classList.remove('active');
            }
        }
    });

    // Theme Swapper
    themeOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            themeOpts.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            
            const theme = opt.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            
            // Sync Canvas color variables dynamically
            if (window.ParticleEngineConfig) {
                window.ParticleEngineConfig.themeColor = themeColors[theme] || '#a855f7';
            }
        });
    });

    // Dynamic Particle sliders sync
    const densitySlider = document.getElementById('particle-count');
    const speedSlider = document.getElementById('particle-speed');

    if (densitySlider) {
        densitySlider.addEventListener('input', (e) => {
            if (window.updateParticleDensity) {
                window.updateParticleDensity(e.target.value);
            }
        });
    }

    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            if (window.ParticleEngineConfig) {
                window.ParticleEngineConfig.speedMultiplier = parseFloat(e.target.value) / 3;
            }
        });
    }

    /* ==========================================================================
       4. INTERSECTION OBSERVER FOR TRANSITIONS & ACTIVE NAV LINKS
       ========================================================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Smooth reveal entries
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // If it contains staggered items, reveal them one by one
                const staggered = entry.target.querySelectorAll('.reveal-item');
                if (staggered.length > 0) {
                    staggered.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                            item.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                        }, index * 150);
                    });
                }
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Force trigger hero staggered loads immediately
    const heroStaggered = document.querySelectorAll('.hero-section .reveal-item');
    heroStaggered.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            item.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        }, index * 180 + 200);
    });

    // Active Section Menu Indicator
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(sec => navObserver.observe(sec));

    /* ==========================================================================
       5. MAGNETIC BUTTON PHYSICS OVERLAY (Haptic Hover Feel)
       ========================================================================== */
    const magnetics = document.querySelectorAll('.magnetic');
    if (window.innerWidth >= 1024) {
        magnetics.forEach(btn => {
            btn.addEventListener('mousemove', function (e) {
                const bounding = btn.getBoundingClientRect();
                
                // Calculate local center offsets
                const x = e.clientX - bounding.left - (bounding.width / 2);
                const y = e.clientY - bounding.top - (bounding.height / 2);
                
                // Translate element towards cursor slightly
                const strength = 18; // Pull intensity
                btn.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
                
                // If it contains a nested span, push it further to create parallax
                const inner = btn.querySelector('span');
                if (inner) {
                    inner.style.transform = `translate(${x / (strength / 1.5)}px, ${y / (strength / 1.5)}px)`;
                }
            });
            
            btn.addEventListener('mouseleave', function () {
                btn.style.transform = 'translate(0px, 0px)';
                const inner = btn.querySelector('span');
                if (inner) {
                    inner.style.transform = 'translate(0px, 0px)';
                }
            });
        });
    }

    /* ==========================================================================
       6. MOBILE MENUS
       ========================================================================== */
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileToggle && mobileOverlay) {
        mobileToggle.addEventListener('click', () => {
            mobileOverlay.classList.toggle('active');
            const isActive = mobileOverlay.classList.contains('active');
            
            // Swap icons between hamburger and close
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', isActive ? 'x' : 'menu');
                lucide.createIcons();
            }
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileOverlay.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
        });
    });

    /* ==========================================================================
       7. DETAILED PROJECTS DATABASE & OVERLAY MODAL
       ========================================================================== */
    const projectDb = {
        'quantum-nexus': {
            title: 'Edupay',
            type: 'WebGL / Spatial Telemetry',
            client: 'Collage',
            timeline: '6 Months (2026)',
            description: 'EduPay is a web-based educational fee management system designed to simplify student fee payments, track transactions, manage records, and provide an efficient admin dashboard for institutions.',
            features: ['Secure Student & Admin Login System. ',
                    'Student Fee Management Dashboard',
                    'Real-Time Payment Status Tracking',
                    'Automatic Receipt Generation',
            ],
            tech: ['Three.js', 'Rust WASM', 'React', 'CSS Grid', 'WebSockets'],
            bgGrad: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(8,5,16,0.95))',
            icon: 'activity'
        },
        'aether-ai': {
            title: 'Aether Semantic Search',
            type: 'AI / Search Engineering',
            client: 'Apex Labs Corp',
            timeline: '4 Months (2023)',
            description: 'Aether AI transforms standard search structures by utilizing contextual semantic indexing instead of static keywords. The platform parses massive documentation clusters, stores vector relationships, and renders natural language responses under a highly fluid layout interface.',
            features: [
                'High-performance text vector mapping with deep-learning embeddings.',
                'Real-time autocomplete and similarity matching scoring.',
                'Fully animated dark-glass charts detailing data density and usage queries.',
                'Staggered layout loading achieving 98 Lighthouse performance metrics.'
            ],
            tech: ['Next.js', 'Python', 'FastAPI', 'Qdrant Vector DB', 'ChartJS'],
            bgGrad: 'linear-gradient(135deg, rgba(6,182,212,0.4), rgba(8,5,16,0.95))',
            icon: 'cpu'
        },
        'aura-ui': {
            title: 'Aura Motion UI Framework',
            type: 'Component Architecture',
            client: 'Open Source Initiative',
            timeline: 'Continuous',
            description: 'Aura Motion is a component design system built for front-end engineers seeking visual excellence. Emphasizing fluid animations and strict glassmorphism, it packages beautiful geometric modules requiring zero framework overhead.',
            features: [
                'Pure hardware-accelerated CSS animations optimized for low-tier platforms.',
                'Dynamic HSL color parsing allowing instant site-wide theme adjustment.',
                'Complete keyboard accessibility compliance and semantic layout structure.',
                'Fully responsive web components packaged as an independent NPM module.'
            ],
            tech: ['Sass', 'Vanilla JS', 'Web Components', 'NPM Bundle', 'Rollup'],
            bgGrad: 'linear-gradient(135deg, rgba(16,185,129,0.4), rgba(8,5,16,0.95))',
            icon: 'palette'
        }
    };

    const modal = document.getElementById('project-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalContent = document.getElementById('modal-body-content');
    const projectCards = document.querySelectorAll('.project-card');

    function openProjectModal(projectId) {
        const data = projectDb[projectId];
        if (!data) return;

        // Construct dynamic modal contents
        modalContent.innerHTML = `
            <div class="modal-image" style="background: ${data.bgGrad}; display: flex; align-items: center; justify-content: center;">
                <i data-lucide="${data.icon}" style="width: 80px; height: 80px; color: var(--color-primary); opacity: 0.8; filter: drop-shadow(0 0 15px var(--color-primary-glow));"></i>
            </div>
            
            <div>
                <h2 class="project-card-title" style="font-size: 2rem; margin-bottom: 0.5rem;">${data.title}</h2>
                <p class="project-type" style="margin-bottom: 1.5rem;">${data.type}</p>
                
                <div class="modal-grid-details">
                    <div>
                        <h4 class="modal-section-title">Project Overview</h4>
                        <p class="modal-desc-para">${data.description}</p>
                        
                        <h4 class="modal-section-title" style="margin-top: 1.5rem;">Key Architecture Accomplishments</h4>
                        <ul style="padding-left: 1.2rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.6rem;">
                            ${data.features.map(feat => `<li style="margin-bottom: 0.4rem; list-style-type: square;"><span style="color: var(--text-main);">${feat}</span></li>`).join('')}
                        </ul>
                    </div>
                    
                    <div>
                        <h4 class="modal-section-title">Deployment Metadata</h4>
                        <ul class="modal-meta-list">
                            <li>
                                <span class="modal-meta-label">Client / Partner</span>
                                <span class="modal-meta-val">${data.client}</span>
                            </li>
                            <li>
                                <span class="modal-meta-label">Timeline</span>
                                <span class="modal-meta-val">${data.timeline}</span>
                            </li>
                            <li>
                                <span class="modal-meta-label">Open Source</span>
                                <span class="modal-meta-val">Available</span>
                            </li>
                        </ul>
                        
                        <h4 class="modal-section-title" style="margin-top: 2rem;">Technologies Integrated</h4>
                        <div class="project-tags" style="margin-top: 0.8rem;">
                            ${data.tech.map(tag => `<span style="border-color: var(--color-primary); color: var(--color-primary);">${tag}</span>`).join('')}
                        </div>

                        <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                            <a href="#" class="btn btn-primary btn-sm magnetic" style="flex: 1;"><span>Live System</span> <i data-lucide="external-link"></i></a>
                            <a href="#" class="btn btn-outline btn-sm magnetic" style="width: 50px; padding: 0;"><i data-lucide="github"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render Icons in modal
        lucide.createIcons();

        // Add magnetic interactions inside the modal
        const modalMagnetics = modalContent.querySelectorAll('.magnetic');
        modalMagnetics.forEach(btn => {
            btn.addEventListener('mousemove', function (e) {
                const bounding = btn.getBoundingClientRect();
                const x = e.clientX - bounding.left - (bounding.width / 2);
                const y = e.clientY - bounding.top - (bounding.height / 2);
                btn.style.transform = `translate(${x / 12}px, ${y / 12}px)`;
            });
            btn.addEventListener('mouseleave', function () {
                btn.style.transform = 'translate(0px, 0px)';
            });
        });

        // Trigger custom cursor hooks inside modal
        const modalInteractives = modalContent.querySelectorAll('a, button');
        modalInteractives.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        });

        // Open modal overlay
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop background scrolling
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Resume scrolling
    }

    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projId = card.getAttribute('data-project');
            openProjectModal(projId);
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Escape Key closes modals and customization panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            if (themePanel) {
                themePanel.classList.remove('active');
            }
        }
    });

    /* ==========================================================================
       8. CONTACT SUBMISSION FORM & GLOWING TOAST ALERTS
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const toastContainer = document.getElementById('toast-container');

    function triggerToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i data-lucide="check-circle" class="toast-success-icon"></i>
            <span class="toast-msg">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        lucide.createIcons();

        // Stagger entrance animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 50);

        // Slide out and remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 4000);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Capture Form variables
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            
            // Mock sending animation states
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Transmitting...</span> <i data-lucide="loader" class="spinner"></i>`;
            lucide.createIcons();
            
            setTimeout(() => {
                // Reset form fields
                nameInput.value = '';
                emailInput.value = '';
                messageInput.value = '';
                
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                lucide.createIcons();
                
                // Show custom toast alert
                triggerToast("Transmission complete! Alex will reply shortly.");
            }, 1500);
        });
    }

});
