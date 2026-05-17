const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'تطبيق ZEUS PRO يعمل بنجاح',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/process-image', express.json(), (req, res) => {
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
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ZEUS PRO - محول الصور الإعلاني</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 600px; width: 90%; }
        h1 { color: #333; margin-bottom: 20px; text-align: center; }
        p { color: #666; line-height: 1.6; margin-bottom: 15px; }
        .status { background: #4CAF50; color: white; padding: 15px; border-radius: 5px; text-align: center; font-weight: bold; margin: 20px 0; }
        .api-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .api-info code { background: #333; color: #0f0; padding: 10px; display: block; border-radius: 3px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 ZEUS PRO</h1>
        <h2 style="text-align: center; color: #667eea; margin-bottom: 30px;">محول الصور الإعلاني</h2>
        <div class="status">✅ التطبيق يعمل بنجاح!</div>
        <p>تطبيق ZEUS PRO هو منصة احترافية لتحويل صور المنتجات إلى إعلانات جذابة وفيديوهات قصيرة لمنصات التواصل الاجتماعي.</p>
        <h3 style="margin-top: 30px; color: #333;">الميزات:</h3>
        <ul style="margin-left: 20px; color: #666;">
          <li>✨ تحويل صور المنتجات إلى إعلانات احترافية</li>
          <li>🎬 إنشاء فيديوهات قصيرة جذابة</li>
          <li>🎨 تخصيص كامل للألوان والنصوص</li>
          <li>📱 واجهة سهلة الاستخدام</li>
          <li>🌍 دعم اللغة العربية</li>
        </ul>
        <div class="api-info">
          <h3 style="color: #333; margin-bottom: 10px;">API المتاح:</h3>
          <code>GET /api/health</code>
          <code style="margin-top: 10px;">POST /api/process-image</code>
        </div>
        <p style="text-align: center; color: #999; margin-top: 30px; font-size: 12px;">© 2026 ZEUS PRO - جميع الحقوق محفوظة</p>
      </div>
    </body>
    </html>
  `);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'خطأ في الخادم', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 تطبيق ZEUS PRO يعمل على المنفذ ${PORT}`);
});

module.exports = app;
