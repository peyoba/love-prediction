// 初始化编辑器
const { createEditor, createToolbar } = window.wangEditor;

const editorConfig = {
    placeholder: '开始写作...',
    onChange(editor) {
        const html = editor.getHtml();
        // 可以实现自动保存功能
    },
    MENU_CONF: {
        uploadImage: {
            server: '/upload/image',
            fieldName: 'image',
            maxFileSize: 5 * 1024 * 1024,
            maxNumberOfFiles: 10,
            allowedFileTypes: ['image/*'],
            metaWithUrl: true,
            customInsert: (res, insertFn) => {
                if (res.error) {
                    alert(res.error);
                    return;
                }
                insertFn(res.url, res.url, res.url);
            },
            onError: (err) => {
                console.error('上传图片错误:', err);
                alert('图片上传失败，请稍后重试');
            }
        }
    }
};

const editor = createEditor({
    selector: '#editor-container',
    html: document.querySelector('#editor-container').innerHTML,
    config: editorConfig,
    mode: 'default'
});

const toolbarConfig = {
    toolbarKeys: [
        'headerSelect',
        'bold',
        'italic',
        'underline',
        'through',
        'color',
        'bgColor',
        '|',
        'fontSize',
        'fontFamily',
        'lineHeight',
        '|',
        'bulletedList',
        'numberedList',
        'todo',
        '|',
        'alignLeft',
        'alignCenter',
        'alignRight',
        '|',
        'quote',
        'code',
        '|',
        'uploadImage',
        'insertTable',
        'codeBlock',
        '|',
        'undo',
        'redo',
    ]
};

const toolbar = createToolbar({
    editor,
    selector: '#editor-toolbar',
    config: toolbarConfig,
    mode: 'default'
});

// 处理封面图上传
const coverInput = document.getElementById('coverImage');
const coverPreview = document.querySelector('.cover-preview');

coverInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/upload/image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            coverPreview.innerHTML = `<img src="${data.url}" alt="封面预览">`;
        } else {
            alert(data.error || '上传失败');
        }
    } catch (error) {
        console.error('上传图片错误:', error);
        alert('上传失败，请稍后重试');
    }
};

// 处理文章表单提交
document.getElementById('articleForm').onsubmit = async (e) => {
    e.preventDefault();

    const formData = {
        title: document.getElementById('title').value,
        summary: document.getElementById('summary').value,
        category: document.getElementById('category').value,
        tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()),
        content: editor.getHtml(),
        coverImage: coverPreview.querySelector('img')?.src
    };

    try {
        const response = await fetch('/blog/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok) {
            alert('发布成功！');
            window.location.href = `/blog/articles/${data.article._id}`;
        } else {
            alert(data.error || '发布失败');
        }
    } catch (error) {
        console.error('发布文章错误:', error);
        alert('发布失败，请稍后重试');
    }
};

// 预览功能
const previewModal = document.getElementById('previewModal');
const previewBtn = document.querySelector('.preview-btn');
const closeBtn = previewModal.querySelector('.close');

previewBtn.onclick = () => {
    document.getElementById('previewTitle').textContent = document.getElementById('title').value;
    document.getElementById('previewCategory').textContent = document.getElementById('category').value;
    document.getElementById('previewTags').textContent = document.getElementById('tags').value;
    document.getElementById('previewContent').innerHTML = editor.getHtml();
    previewModal.style.display = 'block';
};

closeBtn.onclick = () => {
    previewModal.style.display = 'none';
};

window.onclick = (e) => {
    if (e.target === previewModal) {
        previewModal.style.display = 'none';
    }
};

// 保存草稿功能
document.querySelector('.save-draft-btn').onclick = async () => {
    const formData = {
        title: document.getElementById('title').value,
        summary: document.getElementById('summary').value,
        category: document.getElementById('category').value,
        tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()),
        content: editor.getHtml(),
        coverImage: coverPreview.querySelector('img')?.src,
        status: 'draft'
    };

    try {
        const response = await fetch('/blog/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok) {
            alert('草稿保存成功！');
        } else {
            alert(data.error || '保存失败');
        }
    } catch (error) {
        console.error('保存草稿错误:', error);
        alert('保存失败，请稍后重试');
    }
}; 