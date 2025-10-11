const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// JSON middleware for API requests
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// API route for order submissions
app.post('/api/submit-order', (req, res) => {
    try {
        const { name, surname, phone, address, quantity = 1 } = req.body;
        
        // Basic validation
        if (!name || !surname || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen tüm alanları doldurun.'
            });
        }
        
        // Phone validation (Turkish format)
        const phoneRegex = /^0[0-9]{3}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir telefon numarası girin.'
            });
        }
        
        // Simulate order processing
        console.log('Order received:', {
            name,
            surname,
            phone,
            address: address || "Telefon görüşmesinde alınacak",
            quantity,
            timestamp: new Date().toISOString()
        });
        
        // Return success response
        res.json({
            success: true,
            message: 'Siparişiniz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.',
            orderNumber: `HS${Date.now()}`,
            estimatedDelivery: '2-3 iş günü'
        });
        
    } catch (error) {
        console.error('Order submission error:', error);
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