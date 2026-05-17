const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// File upload setup
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'تطبيق ZEUS PRO يعمل بنجاح',
    timestamp: new Date().toISOString()
  });
});

// Process image
app.post('/api/process-image', upload.single('image'), async (req, res) => {
  try {
    const { text, backgroundColor, fontSize, textColor, fontFamily } = req.body;

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'لم يتم تحميل صورة' 
      });
    }

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const imageDataUrl = `data:${req.file.mimetype};base64,${imageBase64}`;

    res.json({ 
      success: true,
      message: 'تمت معالجة الصورة بنجاح',
      data: {
        originalImage: imageDataUrl,
        text: text || 'منتج رائع',
        fontSize: fontSize || 40,
        textColor: textColor || '#FFFFFF',
        backgroundColor: backgroundColor || '#000000',
        fontFamily: fontFamily || 'Arial'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'خطأ في معالجة الصورة',
      message: error.message 
    });
  }
});

// Main page with UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ZEUS PRO - محول الصور الإعلاني</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          min-height: 100vh; 
          padding: 20px;
        }
        .container { 
          max-width: 900px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 15px; 
          box-shadow: 0 20px 60px rgba(0,0,0,0.3); 
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 20px; 
          text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .content { padding: 40px 20px; }
        .form-group { margin-bottom: 25px; }
        .form-group label { 
          display: block; 
          margin-bottom: 8px; 
          font-weight: 600; 
          color: #333;
        }
        .form-group input,
        .form-group textarea,
        .form-group select { 
          width: 100%; 
          padding: 12px; 
          border: 2px solid #e0e0e0; 
          border-radius: 8px; 
          font-size: 1em;
          font-family: inherit;
          transition: border-color 0.3s;
        }
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus { 
          outline: none; 
          border-color: #667eea;
        }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
        }
        .color-input { cursor: pointer; height: 50px; }
        .button { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 15px 40px; 
          border: none; 
          border-radius: 8px; 
          font-size: 1.1em; 
          font-weight: 600; 
          cursor: pointer; 
          transition: transform 0.2s, box-shadow 0.2s;
          width: 100%;
        }
        .button:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        .button:active { transform: translateY(0); }
        .button:disabled { 
          opacity: 0.6; 
          cursor: not-allowed;
        }
        .result { 
          margin-top: 40px; 
          padding: 20px; 
          background: #f9f9f9; 
          border-radius: 8px; 
          display: none;
        }
        .result.show { display: block; }
        .canvas-container {
          position: relative;
          display: inline-block;
          width: 100%;
          margin-bottom: 15px;
        }
        #canvas {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          border: 2px solid #e0e0e0;
        }
        .result-info { 
          background: white; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 15px;
        }
        .result-info p { margin: 8px 0; color: #666; }
        .download-btn { 
          background: #4CAF50; 
          margin-top: 15px;
        }
        .download-btn:hover { 
          box-shadow: 0 10px 20px rgba(76, 175, 80, 0.4);
        }
        .loading { 
          display: none; 
          text-align: center; 
          padding: 20px;
        }
        .loading.show { display: block; }
        .spinner { 
          border: 4px solid #f3f3f3; 
          border-top: 4px solid #667eea; 
          border-radius: 50%; 
          width: 40px; 
          height: 40px; 
          animation: spin 1s linear infinite; 
          margin: 0 auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .error { 
          background: #ffebee; 
          color: #c62828; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 20px; 
          display: none;
        }
        .error.show { display: block; }
        .file-input-wrapper {
          position: relative;
          overflow: hidden;
          display: inline-block;
          width: 100%;
        }
        .file-input-wrapper input[type=file] {
          position: absolute;
          left: -9999px;
        }
        .file-input-label {
          display: block;
          padding: 20px;
          background: #f5f5f5;
          border: 2px dashed #667eea;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        .file-input-label:hover {
          background: #f0f0f0;
          border-color: #764ba2;
        }
        .file-input-label.dragover {
          background: #e8eaf6;
          border-color: #764ba2;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 ZEUS PRO</h1>
          <p>محول الصور الإعلاني</p>
        </div>
        
        <div class="content">
          <div class="error" id="error"></div>
          
          <form id="imageForm">
            <div class="form-group">
              <label>📸 اختر صورة المنتج</label>
              <div class="file-input-wrapper">
                <input type="file" id="image" accept="image/*" required>
                <label for="image" class="file-input-label">
                  <div>اضغط هنا أو اسحب الصورة</div>
                  <small style="color: #999;">PNG, JPG, GIF (حتى 50MB)</small>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="text">✍️ النص الإعلاني</label>
              <input type="text" id="text" placeholder="أدخل النص الذي تريده على الصورة" value="منتج رائع">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="textColor">🎨 لون النص</label>
                <input type="color" id="textColor" class="color-input" value="#FFFFFF">
              </div>
              <div class="form-group">
                <label for="backgroundColor">🖼️ لون الخلفية</label>
                <input type="color" id="backgroundColor" class="color-input" value="#000000">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="fontSize">📏 حجم النص</label>
                <input type="number" id="fontSize" min="10" max="100" value="40">
              </div>
              <div class="form-group">
                <label for="fontFamily">🔤 نوع الخط</label>
                <select id="fontFamily">
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier">Courier</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
            </div>

            <button type="submit" class="button">🎬 إنشاء الإعلان</button>
          </form>

          <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="margin-top: 15px; color: #666;">جاري معالجة الصورة...</p>
          </div>

          <div class="result" id="result">
            <h2 style="color: #333; margin-bottom: 20px;">✅ تم إنشاء الإعلان بنجاح!</h2>
            <div class="canvas-container">
              <canvas id="canvas"></canvas>
            </div>
            <div class="result-info">
              <p><strong>النص:</strong> <span id="resultText"></span></p>
              <p><strong>حجم النص:</strong> <span id="resultFontSize"></span></p>
              <p><strong>لون النص:</strong> <span id="resultTextColor"></span></p>
              <p><strong>لون الخلفية:</strong> <span id="resultBgColor"></span></p>
            </div>
            <button type="button" class="button download-btn" onclick="downloadImage()">⬇️ تحميل الصورة</button>
          </div>
        </div>
      </div>

      <script>
        const form = document.getElementById('imageForm');
        const loading = document.getElementById('loading');
        const result = document.getElementById('result');
        const error = document.getElementById('error');
        const fileInput = document.getElementById('image');
        const fileLabel = document.querySelector('.file-input-label');

        // Drag and drop
        fileLabel.addEventListener('dragover', (e) => {
          e.preventDefault();
          fileLabel.classList.add('dragover');
        });

        fileLabel.addEventListener('dragleave', () => {
          fileLabel.classList.remove('dragover');
        });

        fileLabel.addEventListener('drop', (e) => {
          e.preventDefault();
          fileLabel.classList.remove('dragover');
          if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
          }
        });

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const imageFile = document.getElementById('image').files[0];
          const text = document.getElementById('text').value;
          const textColor = document.getElementById('textColor').value;
          const backgroundColor = document.getElementById('backgroundColor').value;
          const fontSize = parseInt(document.getElementById('fontSize').value);
          const fontFamily = document.getElementById('fontFamily').value;

          if (!imageFile) {
            showError('الرجاء اختيار صورة');
            return;
          }

          loading.classList.add('show');
          error.classList.remove('show');
          result.classList.remove('show');

          try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('text', text);
            formData.append('textColor', textColor);
            formData.append('backgroundColor', backgroundColor);
            formData.append('fontSize', fontSize);
            formData.append('fontFamily', fontFamily);

            const response = await fetch('/api/process-image', {
              method: 'POST',
              body: formData
            });

            const data = await response.json();

            if (data.success) {
              // Draw on canvas
              const canvas = document.getElementById('canvas');
              const ctx = canvas.getContext('2d');
              const img = new Image();

              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw background
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw image
                ctx.drawImage(img, 0, 0);

                // Draw text
                ctx.fillStyle = textColor;
                ctx.font = \`bold \${fontSize}px \${fontFamily}\`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Add shadow for better readability
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                ctx.fillText(text, canvas.width / 2, canvas.height / 2);

                // Update result info
                document.getElementById('resultText').textContent = text;
                document.getElementById('resultFontSize').textContent = fontSize + 'px';
                document.getElementById('resultTextColor').textContent = textColor;
                document.getElementById('resultBgColor').textContent = backgroundColor;

                result.classList.add('show');
              };

              img.src = data.data.originalImage;
            } else {
              showError(data.error || 'حدث خطأ في معالجة الصورة');
            }
          } catch (err) {
            showError('خطأ في الاتصال: ' + err.message);
          } finally {
            loading.classList.remove('show');
          }
        });

        function showError(message) {
          error.textContent = message;
          error.classList.add('show');
        }

        function downloadImage() {
          const canvas = document.getElementById('canvas');
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = 'zeus-pro-ad.png';
          link.click();
        }
      </script>
    </body>
    </html>
  `);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    error: 'خطأ في الخادم',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 تطبيق ZEUS PRO يعمل على المنفذ \${PORT}\`);
});

module.exports = app;
