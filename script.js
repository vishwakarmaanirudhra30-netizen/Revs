(function() {
    // ============ FLEET DATA (3 images each) ============
    const fleetData = [
        { 
            id: 'card-rider', name: 'REVS Rider', 
            desc: 'An exceptional and powerful model resembling brilliance, vibrancy, and allure. Make it your ultimate comfort partner on rough roads.',
            colors: ['Wine Red', 'Metallic Grey', 'Ice Blue', 'Ivory White'],
            hexes: ['#7b2d3b', '#9a9a9a', '#b8d8e8', '#f5f5f0'],
            images: [
                'rider1.jpg',
                'rider2.jpg',
                'rider3.jpg'
            ]
        },
        { 
            id: 'card-rider super', name: 'REVS Rider Super', 
            desc: 'A unique and potent model embodying brilliance, vitality, and attractiveness. Specifically designed for comfort on bumpy roads.',
            colors: ['Ivory White', 'Metallic Black', 'Metallic Grey', 'Wine Red'],
            hexes: ['#f5f5f0', '#1a1a1a', '#9a9a9a', '#7b2d3b'],
            images: [
                'rs1.jpg',
                'rs2.jpg',
                'rs3.jpg'
            ]
        },
        { 
            id: 'card-Electra', name: 'REVS Electra max', 
            desc: 'A cutting-edge and environmentally friendly compact scooter. Practical alternative for urban congestion.',
            colors: ['Ivory White', 'Metallic Grey', 'Metallic Black'],
            hexes: ['#f5f5f0', '#9a9a9a', '#1a1a1a'],
            images: [
                'em1.jpg',
                'em2.jpg',
                'em3.jpg'
            ]
        },
        { 
            id: 'card-Royal', name: 'REVS Royal', 
            desc: 'Ready to provide you with a swift, opulent journey. Features lithium-ion and lead-acid options.',
            colors: ['Metallic Black', 'Ivory White'],
            hexes: ['#1a1a1a', '#f5f5f0'],
            images: [
                'ro1.jpg',
                'ro2.jpg',
                'ro3.jpg'
            ]
        },
        { 
            id: 'card-legend', name: 'REVS Legend sigma', 
            desc: 'Classic styling designed to make you feel like a legend with its comfort, strong build, and trendy look.',
            colors: ['Vibrant Yellow', 'Wine Red', 'Metallic Black', 'Metallic Yellow', 'Metallic Grey', 'Ivory White'],
            hexes: ['#f0c040', '#7b2d3b', '#1a1a1a', '#c8a030', '#9a9a9a', '#f5f5f0'],
            images: [
                'ls1.jpg',
                'ls2.jpg',
                'ls3.jpg'
            ]
        },
        { 
            id: 'card-monarch', name: 'REVS Monarch Deluxe', 
            desc: 'Highly effective in power consumption. Lithium-ion batteries provide a respectable range.',
            colors: ['Wine Red', 'Ivory White', 'Ice Blue', 'Metallic'],
            hexes: ['#7b2d3b', '#f5f5f0', '#b8d8e8', '#9a9a9a'],
            images: [
                'md1.jpg',
                'md2.jpg',
                'md3.jpg'
            ]
        },
        { 
            id: 'card-accessories', name: 'REVS accessories', 
            desc: 'Crafted for riders who need tremendous velocity without sacrificing craftsmanship and security.',
            colors: ['Metallic Black', 'OSM Green', 'Ivory White', 'Purple', 'Metallic Grey'],
            hexes: ['#1a1a1a', '#4a7c3f', '#f5f5f0', '#6b3fa0', '#9a9a9a'],
            images: [
                'ac1.jpg',
                'ac2.jpg',
                'ac3.jpg',
                'ac4.jpg'
            ]
        }
    ];

    // ============ DOM REFS ============
    const fleetGrid = document.getElementById('fleet-grid');
    const mainNav = document.getElementById('mainNav');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    const dropdownTrigger = document.querySelector('.dropdown-trigger');
    const dropdownContent = document.querySelector('.dropdown-content');
    const specTabs = document.querySelectorAll('#specTabsWrapper .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const visionSwatches = document.querySelectorAll('#vision-swatches .swatch');
    const visionColorLabel = document.getElementById('vision-color-label');

    // ============ RENDER FLEET CARDS ============
    function renderFleetCards() {
        if (!fleetGrid) return;
        fleetGrid.innerHTML = fleetData.map((scooter, idx) => {
            const defaultColor = scooter.colors[0];
            const swatchHTML = scooter.colors.map((color, ci) => {
                const hex = scooter.hexes[ci];
                const isActive = ci === 0;
                const borderStyle = (color === 'Ivory White') ? 'border:1px solid #ccc;' : '';
                return `<button class="swatch ${isActive ? 'active' : ''}" style="background:${hex};${borderStyle}" data-color="${color}" data-hex="${hex}" data-card-id="${scooter.id}" aria-label="${color}"></button>`;
            }).join('');

            const imageSlides = scooter.images.map((img, i) => {
                return `<img src="${img}" alt="${scooter.name} photo ${i+1}" class="card-image absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-700 ${i === 0 ? 'opacity-100' : 'opacity-0'}" data-index="${i}" draggable="false">`;
            }).join('');

            const dotsHTML = scooter.images.map((_, i) => {
                return `<button class="image-dot w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${i === 0 ? 'bg-white border-white scale-125' : 'bg-white/40 border-white/60 hover:bg-white/70'}" data-index="${i}" aria-label="Image ${i+1}"></button>`;
            }).join('');

            return `
                <div class="glass-card p-4 flex flex-col h-full animate-on-scroll" id="${scooter.id}" style="transition-delay: ${idx * 0.06}s;">
                    <div class="relative w-full aspect-[4/3] mb-4 rounded-2xl overflow-hidden bg-[var(--glass-bg-light)] image-slider-container" data-card-id="${scooter.id}">
                        ${imageSlides}
                        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                            ${dotsHTML}
                        </div>
                    </div>
                    <div class="flex items-start justify-between mb-3">
                        <h3 class="font-display font-bold text-xl md:text-2xl tracking-tight text-[var(--text-primary)]">${scooter.name}</h3>
                        <span class="text-xs font-mono bg-[var(--glass-bg-light)] px-2.5 py-1 rounded-full text-[var(--text-muted)] shrink-0">EV</span>
                    </div>
                    <p class="text-[var(--text-secondary)] text-sm leading-relaxed flex-grow mb-5">${scooter.desc}</p>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Colors</p>
                        <div class="flex flex-wrap items-center gap-2 swatch-group" data-card-id="${scooter.id}">
                            ${swatchHTML}
                            <span class="swatch-label active-label text-xs" id="label-${scooter.id}">${defaultColor}</span>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-[var(--glass-border)] flex items-center justify-between">
                        <span class="text-xs text-[var(--text-muted)]">${scooter.colors.length} color options</span>
                        <span class="text-xs font-semibold text-[var(--accent)] cursor-pointer hover:underline">View Details →</span>
                    </div>
                </div>`;
        }).join('');

        // Swatch listeners
        fleetGrid.querySelectorAll('.swatch').forEach(swatch => {
            swatch.addEventListener('click', function() {
                const cardId = this.dataset.cardId;
                const color = this.dataset.color;
                const group = fleetGrid.querySelector(`.swatch-group[data-card-id="${cardId}"]`);
                if (group) {
                    group.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                    group.querySelectorAll('.swatch-label').forEach(l => l.classList.remove('active-label'));
                }
                this.classList.add('active');
                const label = document.getElementById(`label-${cardId}`);
                if (label) {
                    label.textContent = color;
                    label.classList.add('active-label');
                }
            });
        });

        // ============ SLIDER LOGIC (autoplay, dots, swipe) ============
        const sliderContainers = fleetGrid.querySelectorAll('.image-slider-container');
        const autoPlayIntervals = new Map();

        // Core function: navigate to a specific slide index
        function goToSlide(container, index) {
            const images = container.querySelectorAll('.card-image');
            const dots = container.querySelectorAll('.image-dot');
            if (images.length === 0) return;
            if (index >= images.length) index = 0;
            if (index < 0) index = images.length - 1;

            images.forEach(img => {
                img.classList.add('opacity-0');
                img.classList.remove('opacity-100');
            });
            images[index].classList.remove('opacity-0');
            images[index].classList.add('opacity-100');

            dots.forEach(d => {
                d.classList.remove('bg-white', 'border-white', 'scale-125');
                d.classList.add('bg-white/40', 'border-white/60');
            });
            dots[index].classList.add('bg-white', 'border-white', 'scale-125');
            dots[index].classList.remove('bg-white/40', 'border-white/60');

            container.dataset.currentIndex = index;
        }

        // Autoplay controls
        function startAutoPlay(container) {
            stopAutoPlay(container);
            const interval = setInterval(() => {
                let current = parseInt(container.dataset.currentIndex || '0');
                const images = container.querySelectorAll('.card-image');
                current = (current + 1) % images.length;
                goToSlide(container, current);
            }, 4000);
            autoPlayIntervals.set(container, interval);
        }

        function stopAutoPlay(container) {
            if (autoPlayIntervals.has(container)) {
                clearInterval(autoPlayIntervals.get(container));
                autoPlayIntervals.delete(container);
            }
        }

        function resetAutoPlay(container) {
            stopAutoPlay(container);
            startAutoPlay(container);
        }

        // Swipe handling (touch + mouse)
        function attachSwipe(container) {
            let startX = 0;
            let startY = 0;
            let isDragging = false;
            let moved = false;
            const SWIPE_THRESHOLD = 50; // px

            const onStart = (clientX, clientY) => {
                startX = clientX;
                startY = clientY;
                isDragging = true;
                moved = false;
                stopAutoPlay(container); // pause while swiping
            };

            const onMove = (clientX, clientY) => {
                if (!isDragging) return;
                const dx = clientX - startX;
                const dy = clientY - startY;
                // Only count as swipe if horizontal movement is greater than vertical
                if (Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) {
                    moved = true;
                    // Prevent default only when we detect a horizontal drag (to avoid page scroll)
                    // We'll prevent default on container via CSS 'touch-action: pan-y' if possible, but here we handle by stopping prop
                    // Actually we'll prevent default on the container's touchmove to avoid pull-to-refresh
                }
            };

            const onEnd = (clientX) => {
                if (!isDragging) return;
                isDragging = false;
                const dx = clientX - startX;
                if (moved && Math.abs(dx) > SWIPE_THRESHOLD) {
                    let current = parseInt(container.dataset.currentIndex || '0');
                    const total = container.querySelectorAll('.card-image').length;
                    if (dx < 0) {
                        // Swipe left -> next image
                        current = (current + 1) % total;
                    } else {
                        // Swipe right -> previous image
                        current = (current - 1 + total) % total;
                    }
                    goToSlide(container, current);
                }
                resetAutoPlay(container); // resume autoplay
            };

            // Touch events
            container.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                onStart(touch.clientX, touch.clientY);
            }, { passive: false });

            container.addEventListener('touchmove', (e) => {
                if (isDragging) {
                    e.preventDefault(); // prevent page scroll when swiping horizontally
                }
                const touch = e.touches[0];
                onMove(touch.clientX, touch.clientY);
            }, { passive: false });

            container.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                // use changedTouches to get the end touch
                const touch = e.changedTouches[0];
                onEnd(touch.clientX);
            });

            // Mouse events
            container.addEventListener('mousedown', (e) => {
                onStart(e.clientX, e.clientY);
                e.preventDefault(); // prevent text selection / image drag
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    onMove(e.clientX, e.clientY);
                }
            });

            document.addEventListener('mouseup', (e) => {
                if (isDragging) {
                    onEnd(e.clientX);
                }
            });

            // To avoid conflict with dot clicks, we stop propagation on dots
            container.querySelectorAll('.image-dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation(); // so dot click doesn't trigger swipe
                    const index = parseInt(dot.dataset.index);
                    goToSlide(container, index);
                    resetAutoPlay(container);
                });
                // For touch, prevent dot from initiating swipe
                dot.addEventListener('touchstart', (e) => e.stopPropagation());
                dot.addEventListener('mousedown', (e) => e.stopPropagation());
            });
        }

        // Initialize each slider
        sliderContainers.forEach(container => {
            const images = container.querySelectorAll('.card-image');
            if (images.length === 0) return;

            container.dataset.currentIndex = '0'; // start index

            // dot click is handled inside attachSwipe to stopPropagation
            attachSwipe(container);

            // Autoplay
            startAutoPlay(container);

            // Pause on hover
            container.addEventListener('mouseenter', () => stopAutoPlay(container));
            container.addEventListener('mouseleave', () => startAutoPlay(container));
        });

        observeAnimatedElements();
    }

    // ============ VISION SWATCHES ============
    function initVisionSwatches() {
        visionSwatches.forEach(swatch => {
            swatch.addEventListener('click', function() {
                visionSwatches.forEach(s => s.classList.remove('active'));
                this.classList.add('active');
                if (visionColorLabel) {
                    visionColorLabel.textContent = this.dataset.color;
                    visionColorLabel.classList.add('active-label');
                }
            });
        });
    }

    // ============ SPECS TABS ============
    function initSpecTabs() {
        specTabs.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = this.dataset.tab;
                specTabs.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                tabContents.forEach(tc => {
                    tc.classList.add('hidden');
                    if (tc.id === `tab-${targetTab}`) tc.classList.remove('hidden');
                });
            });
        });
    }

    // ============ THEME ============
    function updateThemeIcons() {
        const isDark = document.documentElement.classList.contains('dark');
        document.querySelectorAll('#icon-sun').forEach(i => i.classList.toggle('hidden', !isDark));
        document.querySelectorAll('#icon-moon').forEach(i => i.classList.toggle('hidden', isDark));
    }
    function toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        html.classList.toggle('dark', !isDark);
        html.classList.toggle('light', isDark);
        localStorage.setItem('revs-theme', isDark ? 'light' : 'dark');
        updateThemeIcons();
    }
    function loadTheme() {
        const saved = localStorage.getItem('revs-theme');
        if (saved === 'light') { document.documentElement.classList.remove('dark'); document.documentElement.classList.add('light'); }
        else if (saved === 'dark') { document.documentElement.classList.add('dark'); document.documentElement.classList.remove('light'); }
        updateThemeIcons();
    }
    themeToggle?.addEventListener('click', toggleTheme);
    themeToggleMobile?.addEventListener('click', toggleTheme);
    loadTheme();

    // ============ MOBILE MENU ============
    hamburger?.addEventListener('click', () => {
        const open = mobileMenu.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', open);
    });
    document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
    }));

    // ============ DROPDOWN ============
    if (dropdownTrigger && dropdownContent) {
        dropdownTrigger.addEventListener('mouseenter', () => dropdownContent.classList.add('show'));
        dropdownTrigger.addEventListener('mouseleave', (e) => {
            if (!dropdownTrigger.contains(e.relatedTarget)) dropdownContent.classList.remove('show');
        });
        dropdownTrigger.querySelector('button')?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });
        dropdownContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                dropdownContent.classList.remove('show');
                const target = link.dataset.scrollTo;
                if (target) setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
            });
        });
        document.addEventListener('click', (e) => {
            if (!dropdownTrigger.contains(e.target)) dropdownContent.classList.remove('show');
        });
    }

    // ============ NAV SCROLL SHADOW ============
    window.addEventListener('scroll', () => mainNav?.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

    // ============ SMOOTH SCROLL ============
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#fleet' || href === '#specs' || href === '#hero' || href === '#contact') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navHeight = mainNav?.offsetHeight || 70;
                    window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - navHeight - 10, behavior: 'smooth' });
                }
            }
        });
    });

    // ============ SCROLL ANIMATIONS ============
    function observeAnimatedElements() {
        const elements = document.querySelectorAll('.animate-on-scroll:not(.observed)');
        if (!('IntersectionObserver' in window)) {
            elements.forEach(el => { el.classList.add('visible','observed'); });
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible','observed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        elements.forEach(el => observer.observe(el));
    }

    // ============ INQUIRY MODAL & WHATSAPP ============
    const enquireBtn = document.getElementById('enquireBtn');
    const modal = document.getElementById('inquiryModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.getElementById('closeModal');
    const inquiryForm = document.getElementById('inquiryForm');
    function openModal() {
        modal.classList.remove('hidden');
        void modal.offsetWidth;
        modalContent.style.transform = 'scale(1)';
        modalContent.style.opacity = '1';
        document.body.style.overflow = 'hidden';
    }
    function closeModalFunc() {
        modalContent.style.transform = 'scale(0.95)';
        modalContent.style.opacity = '0';
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
    enquireBtn?.addEventListener('click', openModal);
    closeModal?.addEventListener('click', closeModalFunc);
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModalFunc(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModalFunc(); });
    inquiryForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('inqName').value.trim();
        const phone = document.getElementById('inqPhone').value.trim();
        const email = document.getElementById('inqEmail').value.trim();
        const model = document.getElementById('inqModel').value;
        const message = document.getElementById('inqMessage').value.trim();
        if (!name || !phone) { alert('Please fill in Name and Phone.'); return; }
        let text = `*REVS Green Energy Inquiry*%0A%0A*Name:* ${name}%0A*Phone:* ${phone}%0A`;
        if (email) text += `*Email:* ${email}%0A`;
        if (model) text += `*Model:* ${model}%0A`;
        if (message) text += `*Message:* ${message}%0A`;
        text += `%0A_Submitted via website_`;
        const whatsappNumber = '919454596729'; // ← Change as needed
        window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
        closeModalFunc();
        inquiryForm.reset();
    });

    // ============ INIT ============
    function init() {
        renderFleetCards();
        initVisionSwatches();
        initSpecTabs();
        observeAnimatedElements();
        window.addEventListener('load', () => { observeAnimatedElements(); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();