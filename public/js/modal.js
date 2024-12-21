class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.closeBtn = this.modal.querySelector('.close');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        // 关闭按钮点击事件
        this.closeBtn.onclick = () => this.close();
        
        // 点击模态框外部关闭
        this.modal.onclick = (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        };
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    open() {
        this.modal.style.display = 'block';
        // 使用 setTimeout 确保过渡效果生效
        setTimeout(() => {
            this.modal.classList.add('show');
        }, 10);
        this.isOpen = true;
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
    
    close() {
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300); // 与 CSS 过渡时间匹配
        this.isOpen = false;
        document.body.style.overflow = '';
    }
}

// 初始化登录和注册模态框
const loginModal = new Modal('loginModal');
const registerModal = new Modal('registerModal');

// 切换模态框
document.querySelector('.switch-to-register').onclick = (e) => {
    e.preventDefault();
    loginModal.close();
    setTimeout(() => {
        registerModal.open();
    }, 300);
};

document.querySelector('.switch-to-login').onclick = (e) => {
    e.preventDefault();
    registerModal.close();
    setTimeout(() => {
        loginModal.open();
    }, 300);
};

// 导航栏按钮点击事件
document.querySelector('.nav-menu .login-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.open();
});

document.querySelector('.nav-menu .register-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.open();
}); 