// 分类切换
const tabBtns = document.querySelectorAll('.tab-btn');
const articleItems = document.querySelectorAll('.article-item');

tabBtns.forEach(btn => {
    btn.onclick = () => {
        const status = btn.dataset.status;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        articleItems.forEach(item => {
            if (status === 'all' || item.dataset.status === status) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    };
});

// 删除文章
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
        if (!confirm('确定要删除这篇文章吗？')) return;

        const articleId = btn.dataset.id;
        try {
            const response = await fetch(`/blog/articles/${articleId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                btn.closest('.article-item').remove();
            } else {
                const data = await response.json();
                alert(data.error || '删除失败');
            }
        } catch (error) {
            console.error('删除文章错误:', error);
            alert('删除失败，请稍后重试');
        }
    };
}); 