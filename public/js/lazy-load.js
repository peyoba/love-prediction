class LazyLoad {
    constructor() {
        this.images = document.querySelectorAll('[data-src]');
        this.options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options);
            this.images.forEach(image => this.observer.observe(image));
        } else {
            this.loadImagesImmediately();
        }
    }
    
    handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }
    
    loadImage(image) {
        const src = image.dataset.src;
        if (!src) return;
        
        image.src = src;
        image.classList.add('fade-in');
        image.removeAttribute('data-src');
    }
    
    loadImagesImmediately() {
        this.images.forEach(image => this.loadImage(image));
    }
}

// 初始化懒加载
new LazyLoad(); 