// 分类筛选
const categoryBtns = document.querySelectorAll('.category-btn');
const articleCards = document.querySelectorAll('.article-card');

categoryBtns.forEach(btn => {
    btn.onclick = () => {
        const category = btn.dataset.category;
        
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        articleCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    };
}); 

// 处理搜索表单提交
document.querySelector('.search-form').onsubmit = (e) => {
    e.preventDefault();
    const keyword = e.target.keyword.value.trim();
    const currentUrl = new URL(window.location.href);
    
    if (keyword) {
        currentUrl.searchParams.set('keyword', keyword);
    } else {
        currentUrl.searchParams.delete('keyword');
    }
    
    window.location.href = currentUrl.toString();
};

// 处理排序选择
document.querySelector('.sort-options select').onchange = (e) => {
    const sort = e.target.value;
    const currentUrl = new URL(window.location.href);
    
    if (sort !== 'newest') {
        currentUrl.searchParams.set('sort', sort);
    } else {
        currentUrl.searchParams.delete('sort');
    }
    
    window.location.href = currentUrl.toString();
};

// 标签云动画
document.querySelectorAll('.tag-cloud .tag').forEach(tag => {
    tag.onmouseover = () => {
        tag.style.transform = 'scale(1.1)';
    };
    
    tag.onmouseout = () => {
        tag.style.transform = 'scale(1)';
    };
}); 