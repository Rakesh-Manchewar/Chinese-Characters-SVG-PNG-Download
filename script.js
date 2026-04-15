// ============================================
// CHINESE CALLIGRAPHY STUDIO
// Optimized & Professional Version
// ============================================

// DOM Elements
const input = document.getElementById("userInput");
const result = document.getElementById("result");
const targetDiv = document.getElementById("character-target-div");
const charCountDisplay = document.getElementById("charCount");
const pngResolutionSelect = document.getElementById("pngResolution");
const notificationContainer = document.getElementById("notificationContainer");
const themeToggle = document.getElementById("themeToggle");

// State
let writers = [];
let currentText = "";
let isDarkMode = false;

// Configuration
const DISPLAY_FONT = "'SimSun', 'STKaiti', 'KaiTi', serif";
const STROKE_COLOR = "#1f2937";
const OUTLINE_COLOR = "#d1d5db";

// ============ THEME MANAGEMENT ============
function initializeTheme() {
    const savedTheme = localStorage.getItem('calligraphy-theme') || 'light';
    isDarkMode = savedTheme === 'dark';
    applyTheme();
}

function applyTheme() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('calligraphy-theme', isDarkMode ? 'dark' : 'light');
    applyTheme();
}

themeToggle.addEventListener('click', toggleTheme);

// ============ INPUT EVENT HANDLING ============
input.addEventListener("input", () => {
    const text = input.value;
    currentText = text;

    // Update character count (excluding whitespace)
    const cleanText = text.replace(/\s/g, "");
    charCountDisplay.textContent = cleanText.length;

    updatePreview(text);
    loadCharacters(text);
});

// ============ PREVIEW UPDATE ============
function updatePreview(text) {
    if (!text.trim()) {
        result.textContent = "Enter text to begin";
        result.classList.add("empty");
    } else {
        result.textContent = text;
        result.classList.remove("empty");
    }
}

// ============ CHARACTER LOADING ============
function loadCharacters(text) {
    targetDiv.innerHTML = "";
    writers = [];

    if (!text.trim()) return;

    const lines = text.split("\n");

    lines.forEach((line, lineIndex) => {
        line.split("").forEach((char, charIndex) => {
            // Skip spaces
            if (char === ' ') {
                const spacer = document.createElement("div");
                spacer.style.width = "140px";
                targetDiv.appendChild(spacer);
                return;
            }

            // Skip other whitespace
            if (/\s/.test(char)) {
                return;
            }

            const uniqueId = `char-${lineIndex}-${charIndex}`;
            const charContainer = document.createElement("div");
            charContainer.id = uniqueId;
            charContainer.className = "character-item";
            targetDiv.appendChild(charContainer);

            try {
                const writer = HanziWriter.create(uniqueId, char, {
                    width: 140,
                    height: 140,
                    padding: 10,
                    strokeColor: STROKE_COLOR,
                    radicalColor: "#2563eb",
                    outlineColor: OUTLINE_COLOR,
                    showOutline: true,
                    showCharacter: false,
                    strokeAnimationSpeed: 1,
                    delayBetweenStrokes: 100,
                    font: "SimSun"
                });

                writers.push({
                    writer: writer,
                    char: char,
                    line: lineIndex,
                    position: charIndex
                });
            } catch (error) {
                console.error(`Error loading character: ${char}`, error);
                charContainer.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ef4444;font-size:11px;text-align:center;">Unable to load</div>`;
            }
        });
    });
}

// ============ ANIMATION CONTROL ============
async function animateCharacters() {
    if (writers.length === 0) {
        showNotification("Please enter Chinese characters first", "warning");
        return;
    }

    input.disabled = true;

    try {
        for (let writerObj of writers) {
            await new Promise((resolve) => {
                writerObj.writer.animateCharacter({
                    onComplete: resolve
                });
            });
        }
        showNotification("✓ Animation complete!", "success");
    } catch (error) {
        console.error("Animation error:", error);
        showNotification("Animation error occurred", "error");
    } finally {
        input.disabled = false;
    }
}

// ============ RESET CANVAS ============
function resetCanvas() {
    writers.forEach(writerObj => {
        writerObj.writer.hideCharacter();
    });
    showNotification("Canvas reset", "info");
}

// ============ SVG GENERATION ============
function createSVG(text) {
    const lines = text.split("\n").filter(line => line.trim());

    const charWidth = 150;
    const spaceWidth = 40;
    const lineHeight = 200;
    const padding = 30;

    // Calculate dimensions
    let maxLineWidth = padding * 2;
    lines.forEach(line => {
        let lineWidth = padding * 2;
        line.split("").forEach(char => {
            lineWidth += (char === ' ') ? spaceWidth : charWidth;
        });
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
    });

    const totalWidth = maxLineWidth;
    const totalHeight = lines.length * lineHeight + padding * 2;

    // Generate SVG
    let textElements = "";
    let yPosition = padding + 110;

    lines.forEach((line) => {
        let xPosition = padding;
        const chars = line.split("");

        chars.forEach((char) => {
            if (char === ' ') {
                xPosition += spaceWidth;
                return;
            }

            textElements += `
                <text 
                    x="${xPosition + charWidth / 2}" 
                    y="${yPosition}"
                    font-family="${DISPLAY_FONT}"
                    font-size="130"
                    font-weight="400"
                    text-anchor="middle"
                    dominant-baseline="central"
                    fill="${STROKE_COLOR}"
                    letter-spacing="2">${escapeXml(char)}</text>
            `;
            xPosition += charWidth;
        });

        yPosition += lineHeight;
    });

    const bgColor = isDarkMode ? "#1f2937" : "#ffffff";
    const accentColor = isDarkMode ? "#374151" : "#f9fafb";

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
        <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgGradient)"/>
        ${textElements}
    </svg>`;
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

// ============ DOWNLOAD FUNCTIONS ============
function downloadSvg() {
    const text = currentText.trim();

    if (!text) {
        showNotification("Please enter characters first", "warning");
        return;
    }

    try {
        const svg = createSVG(text);
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const filename = generateFilename(text, "svg");
        downloadFile(blob, filename);
        showNotification("✓ SVG downloaded successfully!", "success");
    } catch (error) {
        console.error("SVG download error:", error);
        showNotification("Failed to download SVG", "error");
    }
}

function downloadPng() {
    const text = currentText.trim();

    if (!text) {
        showNotification("Please enter characters first", "warning");
        return;
    }

    try {
        const resolution = parseInt(pngResolutionSelect.value) || 2;
        const svg = createSVG(text);
        const img = new Image();
        const canvas = document.createElement("canvas");

        const lines = text.split("\n").filter(line => line.trim());
        const charWidth = 150;
        const spaceWidth = 40;
        const lineHeight = 200;
        const padding = 30;

        // Calculate dimensions
        let maxLineWidth = padding * 2;
        lines.forEach(line => {
            let lineWidth = padding * 2;
            line.split("").forEach(char => {
                lineWidth += (char === ' ') ? spaceWidth : charWidth;
            });
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        });

        const baseWidth = maxLineWidth;
        const baseHeight = lines.length * lineHeight + padding * 2;

        canvas.width = baseWidth * resolution;
        canvas.height = baseHeight * resolution;

        const ctx = canvas.getContext("2d");
        ctx.scale(resolution, resolution);

        img.onload = () => {
            ctx.drawImage(img, 0, 0, baseWidth, baseHeight);
            canvas.toBlob((blob) => {
                const filename = generateFilename(text, "png");
                downloadFile(blob, filename);
                showNotification(`✓ PNG downloaded at ${resolution}x resolution!`, "success");
            }, "image/png");
        };

        img.onerror = () => {
            showNotification("Failed to generate PNG", "error");
        };

        const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        img.src = URL.createObjectURL(svgBlob);
    } catch (error) {
        console.error("PNG download error:", error);
        showNotification("Failed to download PNG", "error");
    }
}

// ============ UTILITY FUNCTIONS ============
function generateFilename(text, format) {
    const cleanText = text
        .replace(/\n/g, "_")
        .replace(/\s+/g, "_")
        .substring(0, 30);

    const timestamp = new Date().toISOString().slice(0, 10);
    return `calligraphy_${cleanText}_${timestamp}.${format}`;
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============ NOTIFICATION SYSTEM ============
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = "slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + Enter to animate
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        animateCharacters();
    }

    // Escape to reset
    if (e.key === "Escape") {
        resetCanvas();
    }
});

// ============ INITIALIZATION ============
document.addEventListener("DOMContentLoaded", () => {
    console.log("Chinese Calligraphy Studio initialized");

    initializeTheme();

    // Set example text
    input.value = "春眠不覺曉\n處處聞啼鳥\n夜來風雨聲\n花落知多少";

    // Trigger initial load
    const event = new Event("input", { bubbles: true });
    input.dispatchEvent(event);
});
