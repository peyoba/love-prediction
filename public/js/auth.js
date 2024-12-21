class PasswordStrength {
    constructor(input, indicator) {
        this.input = input;
        this.indicator = indicator;
        this.init();
    }
    
    init() {
        this.input.addEventListener('input', () => this.checkStrength());
    }
    
    checkStrength() {
        const password = this.input.value;
        let strength = 0;
        
        // 长度检查
        if (password.length >= 8) strength++;
        
        // 包含数字
        if (/\d/.test(password)) strength++;
        
        // 包含字母
        if (/[a-zA-Z]/.test(password)) strength++;
        
        // 包含特殊字符
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        this.updateIndicator(strength);
    }
    
    updateIndicator(strength) {
        this.indicator.className = 'password-strength';
        if (strength >= 4) {
            this.indicator.classList.add('strength-strong');
        } else if (strength >= 2) {
            this.indicator.classList.add('strength-medium');
        } else if (strength >= 1) {
            this.indicator.classList.add('strength-weak');
        }
    }
}

// 初始化密码强度检查
const passwordInput = document.getElementById('registerPassword');
const strengthIndicator = document.querySelector('.password-strength');
if (passwordInput && strengthIndicator) {
    new PasswordStrength(passwordInput, strengthIndicator);
} 