document.getElementById('profileForm').onsubmit = async (e) => {
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
        const response = await fetch('/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok) {
            alert('个人资料更新成功！');
            window.location.reload();
        } else {
            alert(data.error || '更新失败');
        }
    } catch (error) {
        console.error('更新个人资料错误:', error);
        alert('更新失败，请稍后重试');
    }
};

// 添加表单验证
function validateForm() {
    const requiredFields = ['age', 'gender', 'personality', 'education', 'marriageGoal'];
    let isValid = true;

    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (!element.value) {
            element.classList.add('invalid');
            isValid = false;
        } else {
            element.classList.remove('invalid');
        }
    });

    // 检查复选框
    const checkboxGroups = ['interests', 'values', 'livingHabits'];
    checkboxGroups.forEach(group => {
        const checked = document.querySelectorAll(`input[name="${group}"]:checked`).length;
        const container = document.querySelector(`input[name="${group}"]`).closest('.checkbox-group');
        if (checked === 0) {
            container.classList.add('invalid');
            isValid = false;
        } else {
            container.classList.remove('invalid');
        }
    });

    return isValid;
}

// 添加实时验证
document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('change', () => {
        validateForm();
    });
});

// 处理导航栏按钮点击
document.querySelector('.profile-btn').onclick = () => {
    window.location.href = '/profile';
};

document.querySelector('.logout-btn').onclick = async () => {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok) {
            alert('登出成功！');
            window.location.href = '/';
        } else {
            alert(data.error || '登出失败');
        }
    } catch (error) {
        console.error('登出错误:', error);
        alert('登出失败，请稍后重试');
    }
}; 