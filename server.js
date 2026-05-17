const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات CORS
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API للتحقق من الخادم
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'تطبيق ZEUS PRO يعمل بنجاح',
    timestamp: new Date().toISOString()
  });
});

// API لمعالجة النص والصور
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
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// صفحة رئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    error: 'خطأ في الخادم',
    message: err.message 
  });
});

// بدء الخادم
app.listen(PORT, () => {
  console.log(`🚀 تطبيق ZEUS PRO يعمل على المنفذ ${PORT}`);
});

module.exports = app;
