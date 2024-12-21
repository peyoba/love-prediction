document.getElementById('feedbackForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const formData = {
        type: document.getElementById('feedbackType').value,
        content: document.getElementById('feedbackContent').value
    };

    try {
        const response = await fetch('/feedback/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            document.getElementById('feedbackForm').reset();
            loadHistory();
        } else {
            alert(data.error || '提交失败');
        }
    } catch (error) {
        console.error('提交反馈错误:', error);
        alert('提交失败，请稍后重试');
    }
};

async function loadHistory() {
    try {
        const response = await fetch('/feedback/history');
        const feedbacks = await response.json();

        const historyList = document.getElementById('historyList');
        historyList.innerHTML = feedbacks.map(feedback => `
            <div class="history-item">
                <div class="history-meta">
                    <span>${new Date(feedback.createdAt).toLocaleString()}</span>
                    <span class="history-status status-${getStatusClass(feedback.status)}">
                        ${feedback.status}
                    </span>
                </div>
                <div class="history-type">${feedback.type}</div>
                <div class="history-content">${feedback.content}</div>
                ${feedback.response ? `
                    <div class="history-response">
                        <strong>回复：</strong>
                        <p>${feedback.response}</p>
                    </div>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('获取反馈历史错误:', error);
    }
}

function getStatusClass(status) {
    switch (status) {
        case '待处理': return 'pending';
        case '处理中': return 'processing';
        case '已完成': return 'completed';
        case '已关闭': return 'closed';
        default: return 'pending';
    }
}

// 页面加载时获取历史记录
loadHistory(); 