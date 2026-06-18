/* ============================================
   CVG PORTFOLIO - BACKEND SERVER
   Contact Form dengan Email Verification
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS - sesuaikan origin dengan domain frontend
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10kb' }));

// ============================================
// RATE LIMITING - Cegah spam
// ============================================

// Limit global: 100 request per 15 menit per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Terlalu banyak request, silakan coba lagi nanti.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(globalLimiter);

// Limit untuk endpoint kontak: 3 request per jam per IP
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Anda sudah mengirim 3 pesan dalam 1 jam. Silakan coba lagi nanti.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Limit untuk verifikasi OTP: 5 request per 10 menit per IP
const verifyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { error: 'Terlalu banyak percobaan verifikasi. Silakan coba lagi 10 menit.' },
    standardHeaders: true,
    legacyHeaders: false
});

// ============================================
// OTP STORAGE (in-memory)
// ============================================
// Struktur: { email: { otp, expiresAt, verified, name, subject, message } }
const otpStore = new Map();

// Bersihkan OTP yang kadaluarsa setiap 5 menit
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (data.expiresAt < now) {
            otpStore.delete(email);
        }
    }
}, 5 * 60 * 1000);

// ============================================
// EMAIL TRANSPORTER (Gmail SMTP)
// ============================================
function createTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn('⚠️  EMAIL_USER atau EMAIL_PASS belum diisi di .env');
        console.warn('   Mode: verifikasi email dinonaktifkan, fallback ke mode simpan lokal');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        // Timeout 10 detik
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    });
}

const transporter = createTransporter();

// ============================================
// GENERATE OTP (6 digit)
// ============================================
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

// ============================================
// KIRIM OTP VERIFIKASI
// ============================================
async function sendVerificationOTP(email, otp) {
    if (!transporter) {
        // Fallback: jika email tidak dikonfigurasi, langsung auto-verified
        return true;
    }

    try {
        const mailOptions = {
            from: `"Gewa Andoko Portfolio" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Kode Verifikasi Email - Portfolio Gewa Andoko',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0eb; margin: 0; padding: 0; }
                        .container { max-width: 500px; margin: 30px auto; background: #fff; border-radius: 12px; 
                                     overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #8B0000, #5C0000); padding: 30px; text-align: center; }
                        .header h1 { color: #FFD700; margin: 0; font-size: 1.5rem; font-family: Georgia, serif; }
                        .header p { color: #FDF5E6; margin: 8px 0 0; font-size: 0.9rem; }
                        .body { padding: 30px; text-align: center; }
                        .otp-box { background: #fdf5e6; border: 2px solid #D4A017; border-radius: 12px; 
                                   padding: 20px; margin: 20px 0; }
                        .otp-code { font-size: 2.5rem; font-weight: bold; letter-spacing: 8px; color: #8B0000; 
                                    font-family: monospace; }
                        .info { color: #666; font-size: 0.85rem; line-height: 1.6; margin: 15px 0; }
                        .warning { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; 
                                    padding: 12px; font-size: 0.8rem; color: #856404; margin-top: 20px; }
                        .footer { padding: 20px; text-align: center; font-size: 0.75rem; color: #999; 
                                  border-top: 1px solid #eee; }
                        .footer .aksara { color: #D4A017; font-size: 1rem; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✦ ꦒꦺꦮ ✦</h1>
                            <p>Portfolio Gewa Andoko</p>
                        </div>
                        <div class="body">
                            <h2 style="color:#2F1B14; margin-top:0;">Verifikasi Email</h2>
                            <p style="color:#666;">Masukkan kode OTP berikut untuk mengirimkan pesan Anda:</p>
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                            </div>
                            <p class="info">
                                Kode ini berlaku selama <strong>5 menit</strong>.<br>
                                Jika Anda tidak meminta verifikasi ini, abaikan email ini.
                            </p>
                            <div class="warning">
                                ⚠️ Jangan bagikan kode ini kepada siapa pun.
                            </div>
                        </div>
                        <div class="footer">
                            <div class="aksara">ꦲꦏꦸ ꦒꦺꦮ ꦄꦤ꧀ꦢꦺꦴꦏꦺꦴ</div>
                            <p style="margin-top:8px;">&copy; 2026 Gewa Andoko. All Rights Reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Gagal kirim OTP email:', error.message);
        return false;
    }
}

// ============================================
// KIRIM PESAN KE PEMILIK (GEWA)
// ============================================
async function sendContactNotification(senderName, senderEmail, subject, message) {
    if (!transporter) {
        // Fallback: simpan ke file lokal
        saveContactToFile(senderName, senderEmail, subject, message);
        return true;
    }

    const receiverEmail = process.env.RECEIVER_EMAIL || process.env.EMAIL_USER;

    try {
        const mailOptions = {
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: receiverEmail,
            replyTo: senderEmail,
            subject: `📬 Portfolio - Pesan Baru dari ${senderName}: ${subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0eb; padding: 20px; }
                        .container { max-width: 550px; margin: auto; background: #fff; border-radius: 12px; 
                                     overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #2F1B14, #1A0F0A); padding: 25px; }
                        .header h1 { color: #FFD700; margin: 0; font-size: 1.3rem; }
                        .header p { color: #FDF5E6; margin: 5px 0 0; font-size: 0.85rem; }
                        .body { padding: 25px; }
                        .field { margin-bottom: 15px; }
                        .field-label { font-size: 0.75rem; text-transform: uppercase; color: #8B7355; 
                                       letter-spacing: 1px; font-weight: 600; }
                        .field-value { font-size: 1rem; color: #2F1B14; margin-top: 3px; 
                                       padding: 8px 12px; background: #fdf5e6; border-radius: 6px; }
                        .message-box { background: #fdf5e6; border-left: 4px solid #D4A017; 
                                       padding: 15px; margin-top: 15px; border-radius: 0 8px 8px 0; }
                        .message-box p { margin: 0; line-height: 1.6; color: #333; white-space: pre-wrap; }
                        .footer { padding: 20px; text-align: center; font-size: 0.75rem; color: #999; 
                                  border-top: 1px solid #eee; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📬 Pesan Baru dari Portfolio</h1>
                            <p>Seseorang telah mengirim pesan melalui website portfoliomu</p>
                        </div>
                        <div class="body">
                            <div class="field">
                                <div class="field-label">Nama</div>
                                <div class="field-value">${senderName}</div>
                            </div>
                            <div class="field">
                                <div class="field-label">Email</div>
                                <div class="field-value">${senderEmail}</div>
                            </div>
                            <div class="field">
                                <div class="field-label">Subjek</div>
                                <div class="field-value">${subject}</div>
                            </div>
                            <div class="field">
                                <div class="field-label">Pesan</div>
                                <div class="message-box">
                                    <p>${message}</p>
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Email ini dikirim melalui sistem verifikasi portfolio Gewa Andoko</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Gagal kirim notifikasi:', error.message);
        // Fallback: simpan ke file
        saveContactToFile(senderName, senderEmail, subject, message);
        return false;
    }
}

// ============================================
// FALLBACK: SIMPAN PESAN KE FILE (jika email gagal)
// ============================================
function saveContactToFile(name, email, subject, message) {
    const dataDir = path.join(__dirname, 'messages');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `message-${timestamp}.json`;
    const filePath = path.join(dataDir, filename);

    const data = {
        timestamp: new Date().toISOString(),
        name,
        email,
        subject,
        message,
        verified: true
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`📁 Pesan disimpan ke: ${filename}`);
}

// ============================================
// API ENDPOINTS
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// ENDPOINT 1: KIRIM OTP VERIFIKASI
// ============================================
app.post('/api/send-otp', contactLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email wajib diisi' });
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Format email tidak valid' });
        }

        // Cek apakah email sudah terverifikasi
        const existing = otpStore.get(email);
        if (existing && existing.verified) {
            return res.json({ success: true, message: 'Email sudah terverifikasi' });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 menit

        // Simpan OTP
        otpStore.set(email, {
            otp,
            expiresAt,
            verified: false,
            name: null,
            subject: null,
            message: null
        });

        // Kirim OTP via email
        const sent = await sendVerificationOTP(email, otp);

        if (!sent) {
            // Jika gagal kirim email (email tidak dikonfigurasi), auto-verified
            otpStore.set(email, {
                ...otpStore.get(email),
                verified: true
            });
            return res.json({
                success: true,
                message: 'Verifikasi tidak diperlukan (email server tidak aktif). Pesan dapat langsung dikirim.',
                autoVerified: true
            });
        }

        res.json({
            success: true,
            message: 'Kode OTP telah dikirim ke email Anda. Silakan cek inbox/spam.',
            expiresIn: 300 // 5 menit dalam detik
        });

    } catch (error) {
        console.error('Error send-otp:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server. Silakan coba lagi.' });
    }
});

// ============================================
// ENDPOINT 2: VERIFIKASI OTP
// ============================================
app.post('/api/verify-otp', verifyLimiter, async (req, res) => {
    try {
        const { email, otp, name, subject, message } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email dan kode OTP wajib diisi' });
        }

        // Cek data OTP
        const otpData = otpStore.get(email);
        if (!otpData) {
            return res.status(400).json({ error: 'Kode OTP tidak ditemukan. Silakan kirim ulang.' });
        }

        // Cek kadaluarsa
        if (Date.now() > otpData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ error: 'Kode OTP sudah kadaluarsa. Silakan kirim ulang.' });
        }

        // Cek apakah sudah terverifikasi
        if (otpData.verified) {
            return res.json({ success: true, message: 'Email sudah terverifikasi' });
        }

        // Verifikasi OTP
        if (otpData.otp !== otp) {
            return res.status(400).json({ error: 'Kode OTP salah. Silakan coba lagi.' });
        }

        // OTP valid - tandai verified dan simpan data pesan
        otpStore.set(email, {
            ...otpData,
            verified: true,
            name: name || null,
            subject: subject || null,
            message: message || null
        });

        // Kirim notifikasi ke pemilik (Gewa)
        if (name && subject && message) {
            const notified = await sendContactNotification(name, email, subject, message);
            if (!notified) {
                console.log('⚠️ Notifikasi email gagal dikirim, pesan tetap diverifikasi.');
            }
        }

        res.json({
            success: true,
            message: '✅ Email berhasil diverifikasi! Pesan Anda akan segera dikirimkan.'
        });

    } catch (error) {
        console.error('Error verify-otp:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server. Silakan coba lagi.' });
    }
});

// ============================================
// ENDPOINT 3: KIRIM PESAN (setelah verifikasi)
// ============================================
app.post('/api/send-message', contactLimiter, async (req, res) => {
    try {
        const { email, name, subject, message } = req.body;

        // Validasi input
        if (!email || !name || !subject || !message) {
            return res.status(400).json({ error: 'Semua field wajib diisi' });
        }

        // Cek apakah email sudah terverifikasi
        const otpData = otpStore.get(email);
        if (!otpData || !otpData.verified) {
            return res.status(403).json({
                error: 'Email belum diverifikasi. Silakan verifikasi OTP terlebih dahulu.',
                needsVerification: true
            });
        }

        // Kirim notifikasi ke pemilik
        const notified = await sendContactNotification(name, email, subject, message);

        // Hapus OTP setelah sukses
        otpStore.delete(email);

        if (notified) {
            res.json({
                success: true,
                message: '✅ Pesan berhasil dikirim! Terima kasih, ' + name + ' 🎉'
            });
        } else {
            // Email server mati, tapi pesan tetap tersimpan di file
            res.json({
                success: true,
                message: '✅ Pesan berhasil diterima dan tersimpan! Terima kasih, ' + name + ' 🎉',
                saved: true
            });
        }

    } catch (error) {
        console.error('Error send-message:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server. Silakan coba lagi.' });
    }
});

// ============================================
// ENDPOINT 4: RESEND OTP
// ============================================
app.post('/api/resend-otp', contactLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email wajib diisi' });
        }

        // Hapus OTP lama
        otpStore.delete(email);

        // Generate OTP baru
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000;

        otpStore.set(email, {
            otp,
            expiresAt,
            verified: false,
            name: null,
            subject: null,
            message: null
        });

        const sent = await sendVerificationOTP(email, otp);

        if (!sent) {
            otpStore.set(email, {
                ...otpStore.get(email),
                verified: true
            });
            return res.json({
                success: true,
                message: 'Verifikasi tidak diperlukan. Pesan dapat langsung dikirim.',
                autoVerified: true
            });
        }

        res.json({
            success: true,
            message: 'Kode OTP baru telah dikirim ke email Anda.'
        });

    } catch (error) {
        console.error('Error resend-otp:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
});

// ============================================
// SERVE STATIC FILES (untuk production)
// ============================================
// Jika ingin serve frontend dari backend yang sama:
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// Fallback ke index.html untuk SPA
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint tidak ditemukan' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   CVG PORTFOLIO - BACKEND SERVER        ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Port    : ${PORT}`);
    console.log(`║  CORS    : ${corsOrigin}`);
    console.log(`║  Email   : ${process.env.EMAIL_USER ? '✅ Terkonfigurasi' : '❌ Tidak aktif (mode file)'}`);
    console.log('╚══════════════════════════════════════════╝');
    console.log(`\n🌐 Server: http://localhost:${PORT}`);
});