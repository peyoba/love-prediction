// 点赞功能
const likeBtn = document.querySelector('.like-btn');
if (likeBtn) {
    likeBtn.onclick = async () => {
        try {
            const postId = likeBtn.dataset.postId;
            const response = await fetch(`/community/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok) {
                // 更新点赞数量
                document.querySelector('.like-count').textContent = data.likes;
                
                // 更新按钮状态
                if (data.isLiked) {
                    likeBtn.classList.add('liked');
                } else {
                    likeBtn.classList.remove('liked');
                }
            } else {
                alert(data.error || '操作失败');
            }
        } catch (error) {
            console.error('点赞操作错误:', error);
            alert('操作失败，请稍后重试');
        }
    };
}

// 评论功能
const commentForm = document.getElementById('commentForm');
if (commentForm) {
    commentForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const content = document.getElementById('commentContent').value;
        const postId = document.querySelector('.like-btn').dataset.postId;

        try {
            const response = await fetch(`/community/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            const data = await response.json();
            if (response.ok) {
                // 清空评论框
                document.getElementById('commentContent').value = '';
                
                // 更新评论列表
                const commentList = document.querySelector('.comment-list');
                commentList.innerHTML = data.comments.map(comment => `
                    <div class="comment-item">
                        <div class="comment-meta">
                            <span class="comment-author">
                                ${comment.user.username}
                            </span>
                            <span class="comment-date">
                                ${new Date(comment.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <div class="comment-content">
                            ${comment.content}
                        </div>
                    </div>
                `).join('');

                // 更新评论数量
                const commentCount = document.querySelector('.post-comments i');
                commentCount.textContent = data.comments.length;
            } else {
                alert(data.error || '评论失败');
            }
        } catch (error) {
            console.error('发表评论错误:', error);
            alert('评论失败，请稍后重试');
        }
    };
}

// 登录提示
const loginPrompt = document.querySelector('.login-prompt .login-btn');
if (loginPrompt) {
    loginPrompt.onclick = (e) => {
        e.preventDefault();
        // 触发导航栏的登录按钮点击事件
        document.querySelector('nav .login-btn').click();
    };
} 