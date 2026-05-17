const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'تطبيق ZEUS PRO يعمل بنجاح',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/process-image', (req, res) => {
  try {
    const { text, backgroundColor, fontSize, textColor } = req.body;
    res.json({ 
      success: true,
      message: 'تمت معالجة الصورة بنجاح',
      data: {
        text: text || 'منتج رائع',
        fontSize: fontSize || 40,
        textColor: textColor || '#FFFFFF',
        backgroundColor: backgroundColor || '#000000'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send(\`
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
        .form-group select { 
          width: 100%; 
          padding: 12px; 
          border: 2px solid #e0e0e0; 
          border-radius: 8px; 
          font-size: 1em;
          font-family: inherit;
        }
        .form-group input:focus,
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
          width: 100%;
        }
        .button:hover { transform: translateY(-2px); }
        .result { 
          margin-top: 40px; 
          padding: 20px; 
          background: #f9f9f9; 
          border-radius: 8px; 
          display: none;
        }
        .result.show { display: block; }
        #canvas { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; }
        .loading { display: none; text-align: center; padding: 20px; }
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 ZEUS PRO</h1>
          <p>محول الصور الإعلاني</p>
        </div>
        
        <div class="content">
          <form id="imageForm">
            <div class="form-group">
              <label for="image">📸 اختر صورة</label>
              <input type="file" id="image" accept="image/*" required>
            </div>

            <div class="form-group">
              <label for="text">✍️ النص</label>
              <input type="text" id="text" value="منتج رائع">
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
            </div>

            <button type="submit" class="button">🎬 إنشاء الإعلان</button>
          </form>

          <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="margin-top: 15px;">جاري المعالجة...</p>
          </div>

          <div class="result" id="result">
            <h2>✅ تم الإنشاء!</h2>
            <canvas id="canvas"></canvas>
            <button type="button" class="button" onclick="downloadImage()">⬇️ تحميل</button>
          </div>
        </div>
      </div>

      <script>
        document.getElementById('imageForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const file = document.getElementById('image').files[0];
          const text = document.getElementById('text').value;
          const textColor = document.getElementById('textColor').value;
          const backgroundColor = document.getElementById('backgroundColor').value;
          const fontSize = parseInt(document.getElementById('fontSize').value);

          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.getElementById('canvas');
              const ctx = canvas.getContext('2d');
              
              canvas.width = img.width;
              canvas.height = img.height;

              ctx.fillStyle = backgroundColor;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);

              ctx.fillStyle = textColor;
              ctx.font = \`bold \${fontSize}px Arial\`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
              ctx.shadowBlur = 10;
              ctx.fillText(text, canvas.width / 2, canvas.height / 2);

              document.getElementById('result').classList.add('show');
              document.getElementById('loading').classList.remove('show');
            };
            img.src = reader.result;
          };
          reader.readAsDataURL(file);

          document.getElementById('loading').classList.add('show');
          document.getElementById('result').classList.remove('show');
        });

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
  \`);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'خطأ في الخادم' });
});

app.listen(PORT, () => {
  console.log(\`🚀 ZEUS PRO على المنفذ \${PORT}\`);
});

module.exports = app;
