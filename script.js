// Default font sizes per resolution (original values × 4)
const RESOLUTION_DEFAULTS = {
    '1920x1080': 240,
    '2560x1440': 320,
    '3840x2160': 480,
    '7680x4320': 640
};

// State management
const state = {
    text: '',
    fontFamily: 'Microsoft YaHei, 微软雅黑',
    fontSize: 480,
    textColor: '#000000',
    bgColor: '#ffffff',
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textAlign: 'center',
    verticalAlign: 'center',
    resolution: '3840x2160',
    theme: 'light'
};

// DOM Elements
const elements = {
    textInput: document.getElementById('textInput'),
    fontFamily: document.getElementById('fontFamily'),
    fontSize: document.getElementById('fontSize'),
    textColor: document.getElementById('textColor'),
    bgColor: document.getElementById('bgColor'),
    boldBtn: document.getElementById('boldBtn'),
    italicBtn: document.getElementById('italicBtn'),
    underlineBtn: document.getElementById('underlineBtn'),
    textAlign: document.getElementById('textAlign'),
    verticalAlign: document.getElementById('verticalAlign'),
    resolution: document.getElementById('resolution'),
    resolutionHint: document.getElementById('resolutionHint'),
    preview: document.getElementById('preview'),
    downloadSVG: document.getElementById('downloadSVG'),
    downloadPNG: document.getElementById('downloadPNG'),
    themeToggle: document.getElementById('themeToggle'),
    notification: document.getElementById('notification')
};

function init() {
    loadTheme();
    attachEventListeners();
    updateResolutionHint();
    updatePreview();
}

function loadTheme() {
    if (state.theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        elements.themeToggle.querySelector('.icon').textContent = '☀️';
    }
}

function updateResolutionHint() {
    const defaultSize = RESOLUTION_DEFAULTS[state.resolution];
    elements.resolutionHint.textContent = `📌 Default font size for current resolution: ${defaultSize}px`;
}

function attachEventListeners() {
    elements.textInput.addEventListener('input', (e) => {
        state.text = e.target.value;
        updatePreview();
    });

    elements.fontFamily.addEventListener('change', (e) => {
        state.fontFamily = e.target.value;
        updatePreview();
    });

    elements.fontSize.addEventListener('input', (e) => {
        state.fontSize = parseInt(e.target.value) || RESOLUTION_DEFAULTS[state.resolution];
        updatePreview();
    });

    elements.textColor.addEventListener('input', (e) => {
        state.textColor = e.target.value;
        updatePreview();
    });

    elements.bgColor.addEventListener('input', (e) => {
        state.bgColor = e.target.value;
        updatePreview();
    });

    elements.boldBtn.addEventListener('click', () => {
        state.isBold = !state.isBold;
        elements.boldBtn.classList.toggle('active');
        updatePreview();
    });

    elements.italicBtn.addEventListener('click', () => {
        state.isItalic = !state.isItalic;
        elements.italicBtn.classList.toggle('active');
        updatePreview();
    });

    elements.underlineBtn.addEventListener('click', () => {
        state.isUnderline = !state.isUnderline;
        elements.underlineBtn.classList.toggle('active');
        updatePreview();
    });

    elements.textAlign.addEventListener('change', (e) => {
        state.textAlign = e.target.value;
        updatePreview();
    });

    elements.verticalAlign.addEventListener('change', (e) => {
        state.verticalAlign = e.target.value;
        updatePreview();
    });

    elements.resolution.addEventListener('change', (e) => {
        state.resolution = e.target.value;
        // Auto-set default font size for the chosen resolution
        state.fontSize = RESOLUTION_DEFAULTS[state.resolution];
        elements.fontSize.value = state.fontSize;
        updateResolutionHint();
        updatePreview();
    });

    elements.downloadSVG.addEventListener('click', downloadSVG);
    elements.downloadPNG.addEventListener('click', downloadPNG);
    elements.themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.body.removeAttribute('data-theme');
        elements.themeToggle.querySelector('.icon').textContent = '🌙';
        state.theme = 'light';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        elements.themeToggle.querySelector('.icon').textContent = '☀️';
        state.theme = 'dark';
    }
}

function updatePreview() {
    const { text, fontFamily, fontSize, textColor, bgColor, isBold, isItalic, isUnderline, textAlign, verticalAlign } = state;

    if (!text.trim()) {
        elements.preview.innerHTML = '';
        return;
    }

    const fontWeight = isBold ? 'bold' : 'normal';
    const fontStyle = isItalic ? 'italic' : 'normal';
    const textDecoration = isUnderline ? 'underline' : 'none';
    const previewFontSize = Math.min(fontSize * 0.5, 36);

    let justifyContent = 'center';
    if (verticalAlign === 'top') justifyContent = 'flex-start';
    else if (verticalAlign === 'bottom') justifyContent = 'flex-end';

    elements.preview.innerHTML = `
        <div style="
            width: 100%;
            height: 100%;
            background-color: ${bgColor};
            display: flex;
            align-items: ${justifyContent};
            justify-content: ${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'};
            padding: 20px;
            box-sizing: border-box;
            border-radius: 6px;
            min-height: 160px;
        ">
            <div style="
                font-family: ${fontFamily};
                font-size: ${previewFontSize}px;
                color: ${textColor};
                font-weight: ${fontWeight};
                font-style: ${fontStyle};
                text-decoration: ${textDecoration};
                text-align: ${textAlign};
                word-wrap: break-word;
                white-space: pre-wrap;
                max-width: 100%;
            ">${escapeHtml(text)}</div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'success') {
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type}`;
    elements.notification.classList.add('show');
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

function downloadSVG() {
    const { text, fontFamily, fontSize, textColor, bgColor, isBold, isItalic, isUnderline, textAlign, verticalAlign } = state;

    if (!text.trim()) {
        showNotification('Please enter some text first!', 'error');
        return;
    }

    try {
        const lines = text.split('\n');
        const lineHeight = fontSize * 1.4;
        const padding = 60;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fontWeight = isBold ? 'bold' : 'normal';
        const fontStyle = isItalic ? 'italic' : 'normal';
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line || ' ').width));
        const width = Math.max(800, maxLineWidth + (padding * 2));
        const height = Math.max(400, (lines.length * lineHeight) + (padding * 2));

        const textDecoration = isUnderline ? 'underline' : 'none';

        let textAnchor = 'middle';
        let xPos = width / 2;
        if (textAlign === 'left') { textAnchor = 'start'; xPos = padding; }
        else if (textAlign === 'right') { textAnchor = 'end'; xPos = width - padding; }

        // Vertical alignment
        const totalTextHeight = lines.length * lineHeight;
        let startY;
        if (verticalAlign === 'top') startY = padding + fontSize;
        else if (verticalAlign === 'bottom') startY = height - padding - totalTextHeight + fontSize;
        else startY = (height - totalTextHeight) / 2 + fontSize;

        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <rect width="100%" height="100%" fill="${bgColor}"/>
            <text x="${xPos}" y="${startY}"
                  font-family="${fontFamily}"
                  font-size="${fontSize}"
                  fill="${textColor}"
                  font-weight="${fontWeight}"
                  font-style="${fontStyle}"
                  text-decoration="${textDecoration}"
                  text-anchor="${textAnchor}">`;

        lines.forEach((line, index) => {
            svgContent += `<tspan x="${xPos}" dy="${index === 0 ? 0 : lineHeight}">${escapeHtml(line)}</tspan>`;
        });

        svgContent += `</text></svg>`;

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `text-image-${Date.now()}.svg`;
        link.click();
        URL.revokeObjectURL(url);

        showNotification('SVG downloaded successfully!', 'success');
    } catch (error) {
        showNotification('Error generating SVG, please try again.', 'error');
        console.error('SVG generation error:', error);
    }
}

function downloadPNG() {
    const { text, fontFamily, fontSize, textColor, bgColor, isBold, isItalic, isUnderline, textAlign, verticalAlign, resolution } = state;

    if (!text.trim()) {
        showNotification('Please enter some text first!', 'error');
        return;
    }

    try {
        const [width, height] = resolution.split('x').map(Number);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        const fontWeight = isBold ? 'bold' : 'normal';
        const fontStyle = isItalic ? 'italic' : 'normal';
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;

        const lineHeight = fontSize * 1.4;
        const padding = Math.max(60, width * 0.05);
        const maxWidth = width - (padding * 2);

        const wrapText = (line) => {
            if (!line.trim()) return [''];
            const words = line.split(' ');
            const wrappedLines = [];
            let currentLine = '';
            words.forEach(word => {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                if (ctx.measureText(testLine).width > maxWidth && currentLine) {
                    wrappedLines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            });
            if (currentLine) wrappedLines.push(currentLine);
            return wrappedLines.length > 0 ? wrappedLines : [''];
        };

        const allWrappedLines = [];
        text.split('\n').forEach(line => allWrappedLines.push(...wrapText(line)));

        const totalTextHeight = allWrappedLines.length * lineHeight;

        let startY;
        if (verticalAlign === 'top') startY = padding + fontSize;
        else if (verticalAlign === 'bottom') startY = height - padding - totalTextHeight + fontSize;
        else startY = (height - totalTextHeight) / 2 + fontSize;

        allWrappedLines.forEach((line, index) => {
            const yPos = startY + (index * lineHeight);

            if (yPos >= fontSize && yPos <= height - fontSize) {
                let xPos;
                if (textAlign === 'center') {
                    ctx.textAlign = 'center';
                    xPos = width / 2;
                } else if (textAlign === 'right') {
                    ctx.textAlign = 'right';
                    xPos = width - padding;
                } else {
                    ctx.textAlign = 'left';
                    xPos = padding;
                }
                ctx.textBaseline = 'alphabetic';
                ctx.fillText(line, xPos, yPos);

                if (isUnderline && line.trim()) {
                    const metrics = ctx.measureText(line);
                    const textWidth = metrics.width;
                    let underlineX = xPos;
                    if (textAlign === 'center') underlineX = xPos - textWidth / 2;
                    else if (textAlign === 'right') underlineX = xPos - textWidth;

                    ctx.beginPath();
                    ctx.moveTo(underlineX, yPos + fontSize * 0.1);
                    ctx.lineTo(underlineX + textWidth, yPos + fontSize * 0.1);
                    ctx.strokeStyle = textColor;
                    ctx.lineWidth = Math.max(2, fontSize / 20);
                    ctx.stroke();
                }
            }
        });

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `text-image-${width}x${height}-${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(url);
            showNotification('PNG downloaded successfully!', 'success');
        }, 'image/png');

    } catch (error) {
        showNotification('Error generating PNG, please try again.', 'error');
        console.error('PNG generation error:', error);
    }
}

init();
