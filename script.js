// State management
const state = {
    text: '',
    fontFamily: 'SimSun, 宋体',
    fontSize: 48,
    textColor: '#000000',
    bgColor: '#ffffff',
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textAlign: 'center',
    resolution: '3840x2160',
    customWidth: 1920,
    customHeight: 1080,
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
    resolution: document.getElementById('resolution'),
    customWidth: document.getElementById('customWidth'),
    customHeight: document.getElementById('customHeight'),
    customDimensions: document.getElementById('customDimensions'),
    preview: document.getElementById('preview'),
    downloadSVG: document.getElementById('downloadSVG'),
    downloadPNG: document.getElementById('downloadPNG'),
    themeToggle: document.getElementById('themeToggle'),
    notification: document.getElementById('notification')
};

// Initialize
function init() {
    loadTheme();
    attachEventListeners();
    updatePreview();
}

// Load theme from memory
function loadTheme() {
    const savedTheme = state.theme;
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        elements.themeToggle.querySelector('.icon').textContent = '☀️';
        state.theme = 'dark';
    }
}

// Save theme to memory
function saveTheme() {
    // Theme is already saved in state object
}

// Attach event listeners
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
        state.fontSize = parseInt(e.target.value) || 48;
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

    elements.resolution.addEventListener('change', (e) => {
        state.resolution = e.target.value;
        if (e.target.value === 'custom') {
            elements.customDimensions.style.display = 'grid';
        } else {
            elements.customDimensions.style.display = 'none';
        }
    });

    elements.customWidth.addEventListener('input', (e) => {
        state.customWidth = parseInt(e.target.value) || 1920;
    });

    elements.customHeight.addEventListener('input', (e) => {
        state.customHeight = parseInt(e.target.value) || 1080;
    });

    elements.downloadSVG.addEventListener('click', downloadSVG);
    elements.downloadPNG.addEventListener('click', downloadPNG);
    elements.themeToggle.addEventListener('click', toggleTheme);
}

// Toggle theme
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
    saveTheme();
}

// Update preview
function updatePreview() {
    const { text, fontFamily, fontSize, textColor, bgColor, isBold, isItalic, isUnderline, textAlign } = state;

    if (!text.trim()) {
        elements.preview.innerHTML = '';
        return;
    }

    const fontWeight = isBold ? 'bold' : 'normal';
    const fontStyle = isItalic ? 'italic' : 'normal';
    const textDecoration = isUnderline ? 'underline' : 'none';

    // Scale down font size for preview (preview is much smaller than actual export)
    const previewFontSize = Math.min(fontSize * 0.5, 32);

    elements.preview.innerHTML = `
        <div style="
            font-family: ${fontFamily};
            font-size: ${previewFontSize}px;
            color: ${textColor};
            background-color: ${bgColor};
            font-weight: ${fontWeight};
            font-style: ${fontStyle};
            text-decoration: ${textDecoration};
            text-align: ${textAlign};
            padding: 20px;
            border-radius: 8px;
            word-wrap: break-word;
            white-space: pre-wrap;
            max-width: 100%;
            width: 100%;
            box-sizing: border-box;
        ">${escapeHtml(text)}</div>
    `;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification
function showNotification(message, type = 'success') {
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type}`;
    elements.notification.classList.add('show');

    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

// Download as SVG
function downloadSVG() {
    const { text, fontFamily, fontSize, textColor, bgColor, isBold, isItalic, isUnderline, textAlign } = state;

    if (!text.trim()) {
        showNotification('Please enter some text first!', 'error');
        return;
    }

    try {
        const lines = text.split('\n');
        const lineHeight = fontSize * 1.4;
        const padding = 60;

        // Calculate approximate width based on text content
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fontWeight = isBold ? 'bold' : 'normal';
        const fontStyle = isItalic ? 'italic' : 'normal';
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
        const width = Math.max(800, maxLineWidth + (padding * 2));
        const height = Math.max(400, (lines.length * lineHeight) + (padding * 2));

        const textDecoration = isUnderline ? 'underline' : 'none';

        let textAnchor = 'middle';
        let xPos = width / 2;
        if (textAlign === 'left') {
            textAnchor = 'start';
            xPos = padding;
        } else if (textAlign === 'right') {
            textAnchor = 'end';
            xPos = width - padding;
        }

        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <rect width="100%" height="100%" fill="${bgColor}"/>
            <text x="${xPos}" y="${padding + fontSize}" 
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
        showNotification('Error generating SVG. Please try again.', 'error');
        console.error('SVG generation error:', error);
    }
}

// Download as PNG
function downloadPNG() {
    const { text, fontFamily, fontSize, textColor, bgColor, isBold, isItalic, isUnderline, textAlign, resolution } = state;

    if (!text.trim()) {
        showNotification('Please enter some text first!', 'error');
        return;
    }

    try {
        let width, height;

        if (resolution === 'custom') {
            width = state.customWidth;
            height = state.customHeight;
        } else {
            [width, height] = resolution.split('x').map(Number);
        }

        if (!width || !height || width < 100 || height < 100) {
            showNotification('Invalid dimensions. Please check your resolution settings.', 'error');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Set text properties
        const fontWeight = isBold ? 'bold' : 'normal';
        const fontStyle = isItalic ? 'italic' : 'normal';
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;

        // Calculate text position and handle line wrapping
        const lineHeight = fontSize * 1.4;
        const padding = Math.max(60, width * 0.05); // 5% padding or minimum 60px
        const maxWidth = width - (padding * 2);

        // Word wrap function
        const wrapText = (line) => {
            if (!line.trim()) return [''];

            const words = line.split(' ');
            const wrappedLines = [];
            let currentLine = '';

            words.forEach(word => {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                const metrics = ctx.measureText(testLine);

                if (metrics.width > maxWidth && currentLine) {
                    wrappedLines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            });

            if (currentLine) {
                wrappedLines.push(currentLine);
            }

            return wrappedLines.length > 0 ? wrappedLines : [''];
        };

        // Process all lines with wrapping
        const allWrappedLines = [];
        const lines = text.split('\n');
        lines.forEach(line => {
            allWrappedLines.push(...wrapText(line));
        });

        // Calculate vertical centering
        const totalTextHeight = allWrappedLines.length * lineHeight;
        let startY = (height - totalTextHeight) / 2 + fontSize;

        // Draw each line
        allWrappedLines.forEach((line, index) => {
            const yPos = startY + (index * lineHeight);

            // Only draw if within canvas bounds
            if (yPos >= fontSize && yPos <= height - fontSize) {
                let xPos;

                // Set alignment and x position
                if (textAlign === 'center') {
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'alphabetic';
                    xPos = width / 2;
                } else if (textAlign === 'right') {
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'alphabetic';
                    xPos = width - padding;
                } else {
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'alphabetic';
                    xPos = padding;
                }

                // Draw text
                ctx.fillText(line, xPos, yPos);

                // Draw underline if needed
                if (isUnderline && line.trim()) {
                    const metrics = ctx.measureText(line);
                    const textWidth = metrics.width;
                    let underlineX = xPos;

                    if (textAlign === 'center') {
                        underlineX = xPos - textWidth / 2;
                    } else if (textAlign === 'right') {
                        underlineX = xPos - textWidth;
                    }

                    const underlineY = yPos + fontSize * 0.1;
                    const underlineThickness = Math.max(2, fontSize / 20);

                    ctx.beginPath();
                    ctx.moveTo(underlineX, underlineY);
                    ctx.lineTo(underlineX + textWidth, underlineY);
                    ctx.strokeStyle = textColor;
                    ctx.lineWidth = underlineThickness;
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
        showNotification('Error generating PNG. Please try again.', 'error');
        console.error('PNG generation error:', error);
    }
}

// Initialize on page load
init();