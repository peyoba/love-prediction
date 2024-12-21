// 模态框控制
const modal = document.getElementById('createPostModal');
const createPostBtn = document.getElementById('createPostBtn');
const closeBtn = document.querySelector('.close');

if (createPostBtn) {
    createPostBtn.onclick = () => {
        modal.style.display = 'block';
    };
}

closeBtn.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
};

// 发布帖子
document.getElementById('createPostForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('postTitle').value,
        category: document.getElementById('postCategory').value,
        content: document.getElementById('postContent').value,
        tags: document.getElementById('postTags').value
    };

    try {
        const response = await fetch('/community/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok) {
            alert('发布成功！');
            window.location.reload();
        } else {
            alert(data.error || '发布失败');
        }
    } catch (error) {
        console.error('发布帖子错误:', error);
        alert('发布失败，请稍后重试');
    }
};

// 分类筛选
const categoryBtns = document.querySelectorAll('.category-btn');
const postCards = document.querySelectorAll('.post-card');

categoryBtns.forEach(btn => {
    btn.onclick = () => {
        const category = btn.dataset.category;
        
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        postCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    };
}); 