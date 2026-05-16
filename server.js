const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد multer لتحميل الملفات
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// إعدادات CORS
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// إنشاء مجلدات إذا لم تكن موجودة
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('outputs')) fs.mkdirSync('outputs');
if (!fs.existsSync('public')) fs.mkdirSync('public');

// API لمعالجة الصورة وإضافة النص
app.post('/api/process-image', upload.single('image'), async (req, res) => {
  try {
    const { text, backgroundColor, fontSize, textColor, position } = req.body;
    const imagePath = req.file.path;
    const outputPath = `outputs/processed_${Date.now()}.png`;

    // تحميل الصورة
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // رسم الصورة
    ctx.drawImage(image, 0, 0);

    // إضافة خلفية شفافة للنص
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, image.height - 100, image.width, 100);

    // إضافة النص
    ctx.fillStyle = textColor || '#FFFFFF';
    ctx.font = `${fontSize || 40}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(text || 'منتج رائع', image.width / 2, image.height - 30);

    // حفظ الصورة المعالجة
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    // حذف الملف المرفوع
    fs.unlinkSync(imagePath);

    res.json({ 
      success: true, 
      image: `/outputs/processed_${Date.now()}.png`,
      message: 'تمت معالجة الصورة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في معالجة الصورة:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API لإنشاء فيديو من الصورة
app.post('/api/create-video', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const outputPath = `outputs/video_${Date.now()}.mp4`;
    const { duration = 5 } = req.body;

    // إنشاء فيديو من الصورة
    ffmpeg()
      .input(imagePath)
      .inputOptions(['-loop 1'])
      .outputOptions([
        '-c:v libx264',
        '-t ' + duration,
        '-pix_fmt yuv420p',
        '-vf scale=1280:720'
      ])
      .output(outputPath)
      .on('end', () => {
        fs.unlinkSync(imagePath);
        res.json({ 
          success: true, 
          video: `/outputs/video_${Date.now()}.mp4`,
          message: 'تم إنشاء الفيديو بنجاح'
        });
      })
      .on('error', (err) => {
        console.error('خطأ في إنشاء الفيديو:', err);
        res.status(500).json({ success: false, error: err.message });
      })
      .run();
  } catch (error) {
    console.error('خطأ:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API لتحميل الملف
app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'outputs', filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'الملف غير موجود' });
    }

    res.download(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// صفحة رئيسية بسيطة
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 تطبيق ZEUS PRO يعمل على http://localhost:${PORT}`);
});
