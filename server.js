const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');
const ADMIN_PASSWORD = 'obeido2026'; // غيّر الباسورد من هنا

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// تأكد من وجود مجلد data
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// تسجيل دخول الأدمين
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(32).toString('hex');
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
  }
});

// استقبال بيانات العميل من الفورم
app.post('/api/submit', (req, res) => {
  const { name, phone, email, service, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'الاسم والهاتف مطلوبان' });
  }
  const submissions = readData();
  const newEntry = {
    id: Date.now(),
    name,
    phone,
    email: email || '',
    service: service || 'غير محدد',
    message: message || '',
    date: new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }),
    status: 'جديد'
  };
  submissions.unshift(newEntry);
  writeData(submissions);
  res.json({ success: true });
});

// جلب كل الطلبات للأدمين
app.get('/api/admin/submissions', (req, res) => {
  const submissions = readData();
  res.json(submissions);
});

// تغيير حالة الطلب
app.patch('/api/admin/submissions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const submissions = readData();
  const idx = submissions.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false });
  submissions[idx].status = status;
  writeData(submissions);
  res.json({ success: true });
});

// حذف طلب
app.delete('/api/admin/submissions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let submissions = readData();
  submissions = submissions.filter(s => s.id !== id);
  writeData(submissions);
  res.json({ success: true });
});

// توليد QR Code بيانات المؤسسة
app.get('/api/qr', async (req, res) => {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:مؤسسة عبيدو للمحاماة والاستشارات القانونية',
    'ORG:مؤسسة عبيدو للمحاماة والاستشارات القانونية',
    'TITLE:استشارات قانونية - محاسبة ضريبية - تخليص جمارك',
    'TEL;TYPE=CELL,WORK:+201111936275',
    'TEL;TYPE=CELL,WORK:+201153232774',
    'EMAIL:lawyer.ahmed.rizk@gmail.com',
    'NOTE:المستشار أحمد عاطف عبيدو - المستشارة ندى عماد مبارك',
    'END:VCARD'
  ].join('\n');

  try {
    const png = await QRCode.toBuffer(vcard, {
      width: 300,
      margin: 2,
      color: { dark: '#1a3a6b', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(png);
  } catch (err) {
    res.status(500).send('QR Error');
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ السيرفر شغال على: http://localhost:${PORT}`);
  console.log(`🔐 لوحة الأدمين:      http://localhost:${PORT}/admin.html`);
  console.log(`🌐 الموقع:             http://localhost:${PORT}/index.html\n`);
});
