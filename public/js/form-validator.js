class FormValidator {
    constructor(form, options = {}) {
        this.form = form;
        this.options = {
            errorClass: 'error',
            successClass: 'success',
            errorMessageClass: 'error-message',
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.form.noValidate = true;
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.form.addEventListener('input', this.handleInput.bind(this));
    }
    
    handleSubmit(e) {
        if (!this.validateForm()) {
            e.preventDefault();
        }
    }
    
    handleInput(e) {
        const field = e.target;
        this.validateField(field);
    }
    
    validateForm() {
        let isValid = true;
        const fields = this.form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const rules = this.getValidationRules(field);
        let isValid = true;
        let errorMessage = '';
        
        for (const rule in rules) {
            const validationResult = this.validateRule(field, rule, rules[rule]);
            if (!validationResult.isValid) {
                isValid = false;
                errorMessage = validationResult.message;
                break;
            }
        }
        
        this.updateFieldStatus(field, isValid, errorMessage);
        return isValid;
    }
    
    getValidationRules(field) {
        const rules = {};
        
        if (field.required) rules.required = true;
        if (field.type === 'email') rules.email = true;
        if (field.minLength) rules.minLength = field.minLength;
        if (field.maxLength) rules.maxLength = field.maxLength;
        if (field.pattern) rules.pattern = field.pattern;
        
        return rules;
    }
    
    validateRule(field, rule, value) {
        const validations = {
            required: () => ({
                isValid: field.value.trim() !== '',
                message: '此字段为必填项'
            }),
            email: () => ({
                isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value),
                message: '请输入有效的邮箱地址'
            }),
            minLength: () => ({
                isValid: field.value.length >= value,
                message: `最少需要${value}个字符`
            }),
            maxLength: () => ({
                isValid: field.value.length <= value,
                message: `最多允许${value}个字符`
            }),
            pattern: () => ({
                isValid: new RegExp(value).test(field.value),
                message: '输入格式不正确'
            })
        };
        
        return validations[rule]();
    }
    
    updateFieldStatus(field, isValid, errorMessage) {
        const container = field.closest('.form-group') || field.parentElement;
        const existingError = container.querySelector(`.${this.options.errorMessageClass}`);
        
        container.classList.remove(this.options.errorClass, this.options.successClass);
        container.classList.add(isValid ? this.options.successClass : this.options.errorClass);
        
        if (!isValid) {
            if (existingError) {
                existingError.textContent = errorMessage;
            } else {
                const error = document.createElement('div');
                error.className = this.options.errorMessageClass;
                error.textContent = errorMessage;
                container.appendChild(error);
            }
        } else if (existingError) {
            existingError.remove();
        }
    }
}

// 初始化表单验证
document.querySelectorAll('form').forEach(form => {
    new FormValidator(form);
}); 