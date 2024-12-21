document.getElementById('predictionForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const formData = {
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        personality: document.getElementById('personality').value,
        interests: Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(cb => cb.value),
        values: Array.from(document.querySelectorAll('input[name="values"]:checked')).map(cb => cb.value),
        education: document.getElementById('education').value,
        occupation: document.getElementById('occupation').value,
        income: document.getElementById('income').value,
        location: document.getElementById('location').value,
        marriageGoal: document.getElementById('marriageGoal').value,
        lifestyle: {
            livingHabits: Array.from(document.querySelectorAll('input[name="livingHabits"]:checked')).map(cb => cb.value)
        }
    };

    try {
        const response = await fetch('/prediction/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok) {
            showResult(data.prediction);
            showRadarChart(data.prediction.compatibility.aspects);
            loadHistory();
        } else {
            alert(data.error || '预测失败');
        }
    } catch (error) {
        console.error('预测错误:', error);
        alert('预测失败，请稍后重试');
    }
};

function showResult(prediction) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.style.display = 'block';

    // 使用动画效果更新总分
    const scoreElement = document.getElementById('score');
    const targetScore = prediction.compatibility.score;
    let currentScore = 0;
    const duration = 1000; // 1秒
    const interval = 20; // 每20ms更新一次
    const steps = duration / interval;
    const increment = targetScore / steps;

    const scoreAnimation = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(scoreAnimation);
        }
        scoreElement.textContent = Math.round(currentScore);
    }, interval);

    // 更新各方面分数
    const aspects = prediction.compatibility.aspects;
    Object.keys(aspects).forEach(key => {
        const score = aspects[key];
        const progressBar = document.getElementById(`${key}Score`);
        const scoreText = document.getElementById(`${key}ScoreText`);
        
        // 使用CSS动画
        progressBar.style.width = `${score}%`;
        scoreText.textContent = `${Math.round(score)}%`;
    });

    // 更新分析文本
    const analysisText = document.getElementById('analysisText');
    analysisText.textContent = prediction.compatibility.analysis;
    
    // 平滑滚动到结果区域
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

async function loadHistory() {
    try {
        const response = await fetch('/prediction/history');
        const predictions = await response.json();

        const historyList = document.getElementById('historyList');
        historyList.innerHTML = predictions.map(p => `
            <div class="history-item">
                <div class="history-score">${p.compatibility.score}%</div>
                <div class="history-info">
                    <p>预测时间: ${new Date(p.createdAt).toLocaleString()}</p>
                    <p>对方信息: ${p.partnerInfo.age}岁, ${p.partnerInfo.gender === 'male' ? '男' : '女'}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('获取历史记录错误:', error);
    }
}

// 页面加载时获取历史记录
loadHistory(); 

// 添加雷达图可视化
function showRadarChart(aspects) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['基础匹配', '生活方式', '价值观', '发展潜力'],
            datasets: [{
                label: '契合度分析',
                data: [
                    aspects.base,
                    aspects.lifestyle,
                    aspects.values,
                    aspects.potential
                ],
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: 'rgba(76, 175, 80, 1)',
                pointBackgroundColor: 'rgba(76, 175, 80, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(76, 175, 80, 1)'
            }]
        },
        options: {
            scale: {
                ticks: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
} 