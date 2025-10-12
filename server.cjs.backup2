const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - gerçek IP'yi al
app.set('trust proxy', true);

// JSON middleware for API requests
app.use(express.json());

// IPv4 zorlama fonksiyonu
function forceIPv4(ip) {
    if (!ip) return null;
    
    ip = ip.trim();
    
    // IPv6 wrapped IPv4 (::ffff:192.168.1.1)
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }
    
    // IPv6 localhost
    if (ip === '::1') {
        ip = '127.0.0.1';
    }
    
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip) ? ip : null;
}

// IP forward middleware
app.use((req, res, next) => {
    // Gerçek kullanıcı IPv4'ünü tespit et
    const possibleIPs = [
        req.headers['cf-connecting-ip'],
        req.headers['x-forwarded-for'],
        req.headers['x-real-ip'],
        req.connection.remoteAddress,
        req.socket.remoteAddress
    ];
    
    let realIPv4 = null;
    
    for (const candidateIP of possibleIPs) {
        if (!candidateIP) continue;
        
        // Multiple IPs durumu
        if (candidateIP.includes(',')) {
            const ips = candidateIP.split(',').map(ip => ip.trim());
            for (const ip of ips) {
                const validIP = forceIPv4(ip);
                if (validIP && !validIP.startsWith('127.') && !validIP.startsWith('192.168.')) {
                    realIPv4 = validIP;
                    break;
                }
            }
            if (realIPv4) break;
        } else {
            const validIP = forceIPv4(candidateIP);
            if (validIP && !validIP.startsWith('127.') && !validIP.startsWith('192.168.')) {
                realIPv4 = validIP;
                break;
            }
        }
    }
    
    // Fallback: local IP'leri de kabul et
    if (!realIPv4) {
        for (const candidateIP of possibleIPs) {
            if (!candidateIP) continue;
            const validIP = forceIPv4(candidateIP);
            if (validIP) {
                realIPv4 = validIP;
                break;
            }
        }
    }
    
    req.realUserIPv4 = realIPv4 || '127.0.0.1';
    console.log('🔍 Detected IPv4:', req.realUserIPv4, 'from headers:', {
        'cf-connecting-ip': req.headers['cf-connecting-ip'],
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'remote': req.connection.remoteAddress
    });
    next();
});

// Serve static files
app.use(express.static('.'));

// API route for order submissions - webhook proxy
app.post('/api/submit-order', async (req, res) => {
    try {
        const { name, surname, phone, address, quantity = 1 } = req.body;
        
        // Basic validation
        if (!name || !surname || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen tüm alanları doldurun.'
            });
        }
        
        // Additional validation for name lengths
        if (name.trim().length < 2 || surname.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Ad ve soyad en az 2 karakter olmalıdır.'
            });
        }
        
        // Combine first name and surname properly
        const fullName = `${name} ${surname}`.trim();
        
        // Analytics verileri varsa ekle
        const analytics = req.body.analytics || {};
        
        // Complete webhook data with all required fields for N8N
        const webhookData = {
            siparisID: 'SIP-' + new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14),
            isim: fullName,
            telefon: phone,
            ip: req.realUserIPv4,
            cihazBilgisi: req.headers['user-agent'] || 'Bilinmeyen Cihaz',
            gelenSite: req.headers['referer'] || req.headers['host'] || 'https://xn--hriyetsagliksonnhaberler-vsc.site',
            zamanDamgasi: new Date().toISOString(),
            webhookUrl: 'https://n8nwork.dtekai.com/webhook/bc74f59e-54c2-4521-85a1-6e21a0438c31',
            yürütmeModu: 'üretme',
            
            // Analytics verileri (N8N'de görünsün diye)
            cihazTipi: analytics.device?.touchSupport ? 'Mobil' : 'Masaüstü',
            ekranBoyutu: analytics.device?.screen ? `${analytics.device.screen.width}x${analytics.device.screen.height}` : 'Bilinmiyor',
            dil: analytics.browser?.language || 'Bilinmiyor',
            platform: analytics.browser?.platform || 'Bilinmiyor',
            sayfadaGeçirilenSure: analytics.behavior?.timeOnPage || 0,
            formDoldurmasuresi: analytics.behavior?.formFillTime || 0,
            scrollYuzdesi: analytics.behavior?.scrollDepth || 0,
            tiklaSayisi: analytics.behavior?.clickCount || 0,
            zamanDilimi: analytics.timing?.timezone || 'Bilinmiyor',
            pazarlamaKaynagi: analytics.marketing?.utmSource || 'Direkt',
            kampanyaAdi: analytics.marketing?.utmCampaign || 'Yok'
        };

        console.log('📤 Webhook Data:', JSON.stringify(webhookData, null, 2));
        console.log('🔍 Full Name Created:', fullName);
        console.log('📞 Phone Number:', phone);
        
        // Analytics verilerini logla
        if (req.body.analytics) {
            console.log('📊 Analytics Data:');
            console.log('   🖥️  Device:', req.body.analytics.device?.screen || 'N/A');
            console.log('   🌐 Browser:', req.body.analytics.browser?.language || 'N/A', '/', req.body.analytics.browser?.platform || 'N/A');
            console.log('   ⏱️  Behavior: Time on page:', req.body.analytics.behavior?.timeOnPage || 0, 'seconds');
            console.log('   📍 Location:', req.body.analytics.timing?.timezone || 'N/A');
            console.log('   🎯 Marketing:', req.body.analytics.marketing?.utmSource || 'Direct');
            console.log('   📈 Facebook Pixel: Lead quality score calculated automatically');
        }

        // Forward to real webhook - N8N URL
        const webhookResponse = await fetch('https://n8nwork.dtekai.com/webhook/bc74f59e-54c2-4521-85a1-6e21a0438c31', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': req.headers['user-agent'] || 'Node.js',
                'X-Forwarded-For': req.realUserIPv4,
                'X-Real-IP': req.realUserIPv4
            },
            body: JSON.stringify(webhookData)
        });

        const webhookResult = await webhookResponse.json();
        console.log('📥 Webhook Response:', webhookResult);

        // Return success response
        res.json({
            success: true,
            message: 'Siparişiniz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.',
            orderNumber: webhookData.siparisID,
            estimatedDelivery: '2-3 iş günü'
        });
        
    } catch (error) {
        console.error('❌ Webhook Error:', error);
        res.status(500).json({
            success: false,
            message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
        });
    }
});

// API route for newsletter subscription
app.post('/api/subscribe-newsletter', (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'E-posta adresi gerekli.'
            });
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir e-posta adresi girin.'
            });
        }
        
        console.log('Newsletter subscription:', { email, timestamp: new Date().toISOString() });
        
        res.json({
            success: true,
            message: 'Bültenimize başarıyla kaydoldunuz!'
        });
        
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
        });
    }
});

// API route for contact form
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen tüm alanları doldurun.'
            });
        }
        
        console.log('Contact form submission:', { name, email, message, timestamp: new Date().toISOString() });
        
        res.json({
            success: true,
            message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
        });
        
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
        });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Hürriyet Sağlık server running at http://localhost:${PORT}`);
    console.log(`📱 Access from outside: http://0.0.0.0:${PORT}`);
});