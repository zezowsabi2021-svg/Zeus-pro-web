const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'خطأ في الخادم', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 تطبيق ZEUS PRO يعمل على المنفذ ${PORT}`);
});

module.exports = app;
