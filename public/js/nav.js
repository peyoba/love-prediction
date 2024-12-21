// 用户菜单交互
class UserMenu {
    constructor() {
        this.menu = document.querySelector('.user-menu');
        this.dropdown = document.querySelector('.user-dropdown');
        this.init();
    }
    
    init() {
        if (!this.menu) return;
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.dropdown.style.display = 'none';
            }
        });
        
        // ESC键关闭下拉菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.dropdown.style.display = 'none';
            }
        });
    }
}

// 初始化用户菜单
new UserMenu(); 

class Navigation {
    constructor() {
        this.nav = document.querySelector('.main-nav');
        this.menu = document.querySelector('.nav-menu');
        this.menuToggle = document.querySelector('.menu-toggle');
        this.dropdown = document.querySelector('.user-dropdown');
        this.lastScroll = 0;
        this.searchToggle = document.querySelector('.search-toggle');
        this.searchPanel = document.querySelector('.search-panel');
        this.searchClose = document.querySelector('.search-close');
        this.searchInput = document.querySelector('.search-input');
        this.searchResults = document.querySelector('.search-results');
        this.scrollProgress = document.querySelector('.scroll-progress');
        
        this.init();
    }
    
    init() {
        // 移动端菜单切换
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMenu());
        }
        
        // 滚动效果
        window.addEventListener('scroll', () => this.handleScroll());
        
        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (this.menu.classList.contains('show') && 
                !this.menu.contains(e.target) && 
                !this.menuToggle.contains(e.target)) {
                this.toggleMenu();
            }
        });
        
        // ESC键关闭菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menu.classList.contains('show')) {
                this.toggleMenu();
            }
        });
        
        // 用户下拉菜单
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dropdown?.classList.toggle('show');
            });
            
            document.addEventListener('click', (e) => {
                if (!userMenu.contains(e.target)) {
                    this.dropdown?.classList.remove('show');
                }
            });
        }
        
        // 搜索面板控制
        if (this.searchToggle) {
            this.searchToggle.addEventListener('click', () => this.openSearch());
            this.searchClose.addEventListener('click', () => this.closeSearch());
            this.searchInput.addEventListener('input', debounce(() => this.handleSearch(), 300));
        }
        
        // 滚动进度条
        window.addEventListener('scroll', () => this.updateScrollProgress());
    }
    
    toggleMenu() {
        this.menuToggle.classList.toggle('active');
        this.menu.classList.toggle('show');
        document.body.classList.toggle('menu-open');
    }
    
    handleScroll() {
        const currentScroll = window.pageYOffset;
        
        // 添加滚动阴影
        if (currentScroll > 0) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
        
        // 自动隐藏/显示导航栏
        if (currentScroll > this.lastScroll && currentScroll > 100) {
            this.nav.classList.add('nav-hidden');
        } else {
            this.nav.classList.remove('nav-hidden');
        }
        
        this.lastScroll = currentScroll;
    }
    
    openSearch() {
        this.searchPanel.classList.add('show');
        this.searchInput.focus();
        document.body.style.overflow = 'hidden';
    }
    
    closeSearch() {
        this.searchPanel.classList.remove('show');
        this.searchInput.value = '';
        this.searchResults.innerHTML = '';
        document.body.style.overflow = '';
    }
    
    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.searchResults.innerHTML = '';
            return;
        }
        
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            this.searchResults.innerHTML = data.results.map(result => `
                <div class="search-result-item" onclick="window.location.href='${result.url}'">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-excerpt">${result.excerpt}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('搜索错误:', error);
            this.searchResults.innerHTML = '<div class="search-error">搜索出错，请稍后重试</div>';
        }
    }
    
    updateScrollProgress() {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        this.scrollProgress.style.width = `${scrolled}%`;
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 初始化导航
new Navigation(); 