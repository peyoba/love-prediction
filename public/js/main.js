// 获取模态框元素
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.querySelector('.login-btn');
const registerBtn = document.querySelector('.register-btn');
const closeBtns = document.querySelectorAll('.close');
const switchToRegister = document.querySelector('.switch-to-register');
const switchToLogin = document.querySelector('.switch-to-login');

// 打开登录模态框
loginBtn.onclick = () => {
    loginModal.style.display = 'block';
};

// 打开注册模态框
registerBtn.onclick = () => {
    registerModal.style.display = 'block';
};

// 关闭模态框
closeBtns.forEach(btn => {
    btn.onclick = () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    };
});

// 切换模态框
switchToRegister.onclick = (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
};

switchToLogin.onclick = (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'block';
};

// 点击模态框外部关闭
window.onclick = (e) => {
    if (e.target === loginModal || e.target === registerModal) {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    }
};

// 处理登录表单提交
document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('登录成功！');
            window.location.reload();
        } else {
            alert(data.error || '登录失败');
        }
    } catch (error) {
        console.error('登录错误:', error);
        alert('登录失败，请稍后重试');
    }
};

// 处理注册表单提交
document.getElementById('registerForm').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('注册成功！');
            window.location.reload();
        } else {
            alert(data.error || '注册失败');
        }
    } catch (error) {
        console.error('注册错误:', error);
        alert('注册失败，请稍后重试');
    }
};

// 在现有代码后添加登出功能
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok) {
                alert('登出成功！');
                window.location.reload();
            } else {
                alert(data.error || '登出失败');
            }
        } catch (error) {
            console.error('登出错误:', error);
            alert('登出失败，请稍后重试');
        }
    };
}

// 处理个人资料按钮点击
const profileBtn = document.querySelector('.profile-btn');
if (profileBtn) {
    profileBtn.onclick = () => {
        window.location.href = '/profile';
    };
}

// 处理开始体验按钮点击
document.querySelector('.cta-button').onclick = () => {
    const user = document.querySelector('.user-menu');
    if (user) {
        window.location.href = '/prediction';
    } else {
        loginModal.style.display = 'block';
    }
};

// 滚动动画
function handleScroll() {
    const elements = document.querySelectorAll('[data-scroll]');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        // 当元素进入视口时添加动画类
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('is-visible');
        }
    });
}

// 数字增长动画
function animateNumbers() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.dataset.count);
        let current = 0;
        const increment = target / 50; // 将动画分为50步
        const duration = 2000; // 2秒完成
        const stepTime = duration / 50;
        
        const counter = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(counter);
            } else {
                stat.textContent = Math.round(current);
            }
        }, stepTime);
    });
}

// 轮播功能
class Carousel {
    constructor(element) {
        this.element = element;
        this.slides = element.querySelectorAll('.testimonial-card');
        this.currentSlide = 0;
        this.slideCount = this.slides.length;
        this.autoplayInterval = null;
        
        this.init();
    }
    
    init() {
        // 创建导航按钮
        this.createNavigation();
        // 设置初始状态
        this.showSlide(0);
        // 启动自动播放
        this.startAutoplay();
        // 添加触摸事件支持
        this.addTouchSupport();
    }
    
    createNavigation() {
        const nav = document.createElement('div');
        nav.className = 'carousel-nav';
        
        // 添加前后按钮
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-prev';
        prevBtn.innerHTML = '&lt;';
        prevBtn.onclick = () => this.prevSlide();
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-next';
        nextBtn.innerHTML = '&gt;';
        nextBtn.onclick = () => this.nextSlide();
        
        // 添加指示器
        const dots = document.createElement('div');
        dots.className = 'carousel-dots';
        
        for (let i = 0; i < this.slideCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.onclick = () => this.showSlide(i);
            dots.appendChild(dot);
        }
        
        nav.appendChild(prevBtn);
        nav.appendChild(dots);
        nav.appendChild(nextBtn);
        this.element.appendChild(nav);
    }
    
    showSlide(index) {
        // 更新当前slide索引
        this.currentSlide = index;
        
        // 更新所有slides的位置
        this.slides.forEach((slide, i) => {
            slide.style.transform = `translateX(${100 * (i - index)}%)`;
        });
        
        // 更新导航点状态
        const dots = this.element.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    nextSlide() {
        this.showSlide((this.currentSlide + 1) % this.slideCount);
    }
    
    prevSlide() {
        this.showSlide((this.currentSlide - 1 + this.slideCount) % this.slideCount);
    }
    
    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // 每5秒切换一次
        
        // 鼠标悬停时暂停自动播放
        this.element.addEventListener('mouseenter', () => {
            clearInterval(this.autoplayInterval);
        });
        
        this.element.addEventListener('mouseleave', () => {
            this.startAutoplay();
        });
    }
    
    addTouchSupport() {
        let startX = 0;
        let isDragging = false;
        
        this.element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });
        
        this.element.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            
            if (Math.abs(diff) > 50) { // 最小滑动距离
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
                isDragging = false;
            }
        });
        
        this.element.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
}

// 响应式导航菜单
class MobileNav {
    constructor() {
        this.burger = document.querySelector('.menu-toggle');
        this.nav = document.querySelector('.nav-menu');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.burger) return;
        
        this.burger.addEventListener('click', () => this.toggleMenu());
        
        // 点击导航链接时关闭菜单
        this.nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (this.isOpen) this.toggleMenu();
            });
        });
        
        // 点击外部时关闭菜单
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.nav.contains(e.target) && !this.burger.contains(e.target)) {
                this.toggleMenu();
            }
        });
    }
    
    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.burger.classList.toggle('active');
        this.nav.classList.toggle('show');
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }
}

// 平滑滚动
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        // 为所有内部链接添加平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    this.scrollToElement(target);
                }
            });
        });
    }
    
    scrollToElement(element) {
        const headerOffset = 70; // 导航栏高度
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// 视差滚动效果
class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('[data-parallax]');
        this.init();
    }
    
    init() {
        if (!this.elements.length) return;
        
        window.addEventListener('scroll', () => this.update());
        window.addEventListener('resize', () => this.update());
        this.update();
    }
    
    update() {
        this.elements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const rect = element.getBoundingClientRect();
            const scrolled = window.pageYOffset;
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = -(scrolled * speed);
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });
    }
}

// 添加页面过渡效果
class PageTransition {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a:not([target="_blank"]):not([href^="#"])').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.hostname === window.location.hostname) {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    this.transitionToPage(href);
                }
            });
        });
    }
    
    transitionToPage(href) {
        document.body.classList.add('page-transition');
        setTimeout(() => {
            window.location.href = href;
        }, 500);
    }
}

// 扩展页面初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化滚动监听
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 首次检查
    
    // 初始化数字动画
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumbers();
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(statsSection);
    }
    
    // 初始化轮播
    const carousel = document.querySelector('.testimonials-slider');
    if (carousel) {
        new Carousel(carousel);
    }
    
    // 初始化新功能
    new MobileNav();
    new SmoothScroll();
    new ParallaxEffect();
    new PageTransition();
    
    // 添加页面加载完成的动画
    document.body.classList.add('page-loaded');
});

// 添加返回顶部按钮
class ScrollToTop {
    constructor() {
        this.button = this.createButton();
        this.init();
    }
    
    createButton() {
        const button = document.createElement('button');
        button.className = 'scroll-to-top';
        button.innerHTML = '↑';
        document.body.appendChild(button);
        return button;
    }
    
    init() {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 200) {
                this.button.classList.add('show');
            } else {
                this.button.classList.remove('show');
            }
        });
        
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// 初始化返回顶部按钮
new ScrollToTop(); 