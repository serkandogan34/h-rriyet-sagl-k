        // Google Sheets için genişletilmiş webhook data
        const enhancedWebhookData = {
            // Mevcut temel bilgiler (Google Sheets'teki mevcut kolonlar)
            siparisID: orderNumber,
            isim: fullName,
            telefon: phone,
            ip: req.realUserIPv4,
            cihazBilgisi: req.headers['user-agent'] || 'Bilinmiyor',
            gelenSite: req.headers.referer || req.headers.origin || req.body.page_url || 'Direkt',
            zamanDamgasi: new Date().toISOString(),
            webhookUrl: 'https://n8nwork.dtekai.com/webhook/bc74f59e-54c2-4521-85a1-6e21a0438c31',
            executionMode: 'production',
            
            // Eksik kolonlar için varsayılan değerler
            sehir: 'Tespit Edilecek', // IP bazlı konum tespiti için
            ilce: 'Tespit Edilecek',  // IP bazlı konum tespiti için
            
            // Yeni analytics kolonları
            ekranBoyutu: analytics.device?.screen ?  : 'Bilinmiyor',
            tarayiciDili: analytics.browser?.language || 'Bilinmiyor',
            platform: analytics.browser?.platform || 'Bilinmiyor',
            cihazTipi: analytics.device?.touchSupport ? 'Mobil' : 'Masaüstü',
            zamanDilimi: analytics.timing?.timezone || 'Bilinmiyor',
            sayfaSuresi: analytics.behavior?.timeOnPage || 0,
            scrollYuzdesi: analytics.behavior?.scrollDepth || 0,
            tiklamaSayisi: analytics.behavior?.clickCount || 0,
            utmKaynak: analytics.marketing?.utmSource || 'Direkt',
            utmKampanya: analytics.marketing?.utmCampaign || 'Yok',
            
            // Lead kalite skoru (1-100 arası hesaplama)
            leadSkoru: calculateLeadScore(analytics, phone, req.realUserIPv4),
            
            // Eski format backward compatibility için
            yürütmeModu: 'üretme',
            pazarlamaKaynagi: analytics.marketing?.utmSource || 'Direkt',
            kampanyaAdi: analytics.marketing?.utmCampaign || 'Yok'
        };

// Lead kalite skorlama fonksiyonu
function calculateLeadScore(analytics, phone, ip) {
    let score = 50; // Base score
    
    // Sayfa etkileşimi (+30 puan max)
    if (analytics.behavior?.timeOnPage > 60) score += 10;
    if (analytics.behavior?.scrollDepth > 70) score += 10;
    if (analytics.behavior?.clickCount > 2) score += 10;
    
    // Cihaz kalitesi (+10 puan max)
    if (analytics.device?.screen?.width > 1200) score += 5;
    if (analytics.browser?.language?.includes('tr')) score += 5;
    
    // Telefon formatı (+10 puan max)
    if (phone && phone.length >= 10) score += 10;
    
    // Pazarlama kaynağı (+/-10 puan)
    const source = analytics.marketing?.utmSource;
    if (source === 'facebook' || source === 'google') score += 10;
    if (source === 'direct') score -= 5;
    
    return Math.min(Math.max(score, 0), 100);
}

