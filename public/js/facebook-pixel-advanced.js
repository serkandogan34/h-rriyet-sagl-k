// 🚀 GELİŞMİŞ FACEBOOK PIXEL ANALYTİK SİSTEMİ
// Rakiplerden çok daha güçlü tracking sistemi

class FacebookPixelAdvanced {
    constructor() {
        this.pixelId = '1536997387317312';
        this.pageLoadTime = Date.now();
        this.engagementEvents = [];
        this.scrollMilestones = [25, 50, 75, 90, 100];
        this.scrollReached = [];
        this.clickEvents = [];
        
        this.init();
    }

    init() {
        this.trackPageEngagement();
        this.trackScrollDepth();
        this.trackClickBehavior();
        this.trackFormInteraction();
        this.trackTimeOnPage();
        this.sendEnhancedPageView();
    }

    // 📊 Gelişmiş PageView - rakiplerden farklı
    sendEnhancedPageView() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Facebook otomatik parametrelerini yakala (rakip tarzı)
        const fbParams = {
            ad_id: urlParams.get('ad_id') || urlParams.get('{ad.id}') || 'organic',
            ad_name: urlParams.get('ad_name') || urlParams.get('{ad.name}') || 'direct',
            adset_name: urlParams.get('adset_name') || urlParams.get('{adset.name}') || 'direct',
            campaign_name: urlParams.get('utm_campaign') || 'direct',
            placement: urlParams.get('utm_medium') || urlParams.get('{placement}') || 'unknown'
        };

        // Cihaz bilgileri
        const deviceInfo = {
            device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            screen_size: `${screen.width}x${screen.height}`,
            browser_language: navigator.language,
            user_agent: navigator.userAgent.substring(0, 100) // İlk 100 karakter
        };

        // Zaman bilgileri
        const timeInfo = {
            local_time: new Date().toLocaleString('tr-TR'),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hour_of_day: new Date().getHours()
        };

        // Enhanced PageView Event
        fbq('track', 'PageView', {
            content_name: 'OZPHYZEN Landing Page',
            content_category: 'Health Products',
            ...fbParams,
            ...deviceInfo,
            ...timeInfo
        });

        // Rakip tarzı Custom PageView
        fbq('trackCustom', 'EnhancedPageView', {
            pixel_redundancy: this.pixelId, // Rakip tarzı redundancy
            doctor_reference: 'Prof. Dr. Mehmet Öz',
            product_category: 'Joint Pain Relief',
            target_age: '35-65',
            ...fbParams,
            ...deviceInfo
        });

        console.log('🎯 Facebook Pixel: Enhanced PageView sent', { fbParams, deviceInfo });
    }

    // 📈 Scroll depth tracking (rakiplerde yok!)
    trackScrollDepth() {
        let maxScroll = 0;
        
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Milestone eventi gönder
                this.scrollMilestones.forEach(milestone => {
                    if (scrollPercent >= milestone && !this.scrollReached.includes(milestone)) {
                        this.scrollReached.push(milestone);
                        
                        fbq('trackCustom', 'ScrollDepth', {
                            content_name: 'OZPHYZEN Page',
                            scroll_percentage: milestone,
                            time_to_scroll: Math.round((Date.now() - this.pageLoadTime) / 1000),
                            device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                        });
                        
                        console.log(`📜 Facebook Pixel: Scroll ${milestone}% tracked`);
                    }
                });
            }
        });
    }

    // 👆 Gelişmiş click tracking
    trackClickBehavior() {
        document.addEventListener('click', (e) => {
            const element = e.target;
            const elementInfo = {
                tag: element.tagName,
                class: element.className,
                id: element.id,
                text: element.innerText?.substring(0, 50) || ''
            };

            // Önemli elementlere özel tracking
            if (element.closest('.order-form-section')) {
                fbq('trackCustom', 'FormSectionClick', {
                    content_name: 'Order Form Area',
                    click_element: elementInfo.tag,
                    click_text: elementInfo.text
                });
            }

            if (element.closest('.testimonial')) {
                fbq('trackCustom', 'TestimonialClick', {
                    content_name: 'Customer Testimonial',
                    engagement_type: 'testimonial_read'
                });
            }

            if (element.closest('.doctor-hero-section')) {
                fbq('trackCustom', 'DoctorImageClick', {
                    content_name: 'Prof. Dr. Mehmet Öz',
                    engagement_type: 'doctor_reference_click'
                });
            }

            // Genel click tracking
            this.clickEvents.push({
                timestamp: Date.now(),
                element: elementInfo
            });
        });
    }

    // 📝 Form etkileşim tracking
    trackFormInteraction() {
        const formFields = document.querySelectorAll('#orderForm input');
        let formStartTime = null;
        let fieldInteractions = {};

        formFields.forEach(field => {
            // Form başlangıcı
            field.addEventListener('focus', (e) => {
                if (!formStartTime) {
                    formStartTime = Date.now();
                    
                    fbq('trackCustom', 'FormStart', {
                        content_name: 'OZPHYZEN Order Form',
                        form_type: 'lead_form',
                        device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                    });
                    
                    console.log('📝 Facebook Pixel: Form started');
                }

                fieldInteractions[e.target.id] = {
                    startTime: Date.now(),
                    field_name: e.target.id
                };
            });

            // Alan tamamlama
            field.addEventListener('blur', (e) => {
                const fieldData = fieldInteractions[e.target.id];
                if (fieldData) {
                    const fillTime = Date.now() - fieldData.startTime;
                    
                    fbq('trackCustom', 'FormFieldComplete', {
                        content_name: 'Form Field',
                        field_name: e.target.id,
                        fill_time_seconds: Math.round(fillTime / 1000),
                        field_value_length: e.target.value.length
                    });
                }
            });
        });
    }

    // ⏰ Sayfa süresi milestones
    trackTimeOnPage() {
        const timeMilestones = [30, 60, 120, 180, 300]; // saniye
        
        timeMilestones.forEach(milestone => {
            setTimeout(() => {
                fbq('trackCustom', 'TimeOnPage', {
                    content_name: 'OZPHYZEN Page',
                    time_milestone: milestone,
                    engagement_quality: milestone > 120 ? 'high' : milestone > 60 ? 'medium' : 'low',
                    scroll_depth: Math.max(...this.scrollReached) || 0,
                    click_count: this.clickEvents.length
                });
                
                console.log(`⏰ Facebook Pixel: ${milestone}s time milestone tracked`);
            }, milestone * 1000);
        });
    }

    // 🎯 Form submit - en önemli event
    trackFormSubmit(formData, analyticsData) {
        const submitTime = Date.now();
        const totalFormTime = formStartTime ? Math.round((submitTime - formStartTime) / 1000) : 0;

        // Standard Lead Event
        fbq('track', 'Lead', {
            content_name: 'OZPHYZEN Lead Form',
            content_category: 'Health Product Lead',
            value: 1,
            currency: 'TRY'
        });

        // Custom Enhanced Lead Event
        fbq('trackCustom', 'QualifiedLead', {
            // Form bilgileri
            form_completion_time: totalFormTime,
            form_quality_score: this.calculateFormQuality(analyticsData),
            
            // Engagement bilgileri  
            time_on_page: Math.round((submitTime - this.pageLoadTime) / 1000),
            scroll_depth: Math.max(...this.scrollReached) || 0,
            click_interactions: this.clickEvents.length,
            
            // Cihaz bilgileri
            device_type: analyticsData?.device?.touchSupport ? 'mobile' : 'desktop',
            screen_resolution: analyticsData?.device?.screen ? 
                `${analyticsData.device.screen.width}x${analyticsData.device.screen.height}` : 'unknown',
            
            // Pazarlama bilgileri
            traffic_source: analyticsData?.marketing?.utmSource || 'direct',
            campaign_name: analyticsData?.marketing?.utmCampaign || 'organic',
            
            // Lokasyon
            timezone: analyticsData?.timing?.timezone || 'unknown',
            
            // Lead quality indicators
            engagement_level: this.calculateEngagementLevel(analyticsData),
            conversion_probability: this.calculateConversionProbability(analyticsData)
        });

        // Rakip tarzı multiple pixel parametreli event
        fbq('trackCustom', 'PremiumLead', {
            pixel_redundancy_1: this.pixelId,
            pixel_redundancy_2: this.pixelId, 
            pixel_redundancy_3: this.pixelId,
            doctor_authority: 'Prof. Dr. Mehmet Öz',
            product_benefit: 'Joint Pain Relief',
            urgency_factor: 'Limited Time Offer'
        });

        console.log('🎯 Facebook Pixel: Lead events sent', { 
            formTime: totalFormTime, 
            engagement: this.clickEvents.length 
        });
    }

    // 📊 Form kalite hesaplama
    calculateFormQuality(analytics) {
        let score = 0;
        
        if (analytics?.behavior?.timeOnPage > 60) score += 25;
        if (analytics?.behavior?.scrollDepth > 70) score += 25;
        if (analytics?.behavior?.formFillTime > 15) score += 20;
        if (analytics?.device?.touchSupport === false) score += 15; // PC kullanıcısı
        if (analytics?.marketing?.utmSource === 'facebook') score += 15;
        
        return Math.min(score, 100);
    }

    // 📈 Engagement level hesaplama
    calculateEngagementLevel(analytics) {
        const timeScore = (analytics?.behavior?.timeOnPage || 0) > 60 ? 'high' : 'medium';
        const scrollScore = (analytics?.behavior?.scrollDepth || 0) > 70 ? 'high' : 'medium';
        const clickScore = (analytics?.behavior?.clickCount || 0) > 8 ? 'high' : 'medium';
        
        const highCount = [timeScore, scrollScore, clickScore].filter(s => s === 'high').length;
        
        return highCount >= 2 ? 'high' : highCount >= 1 ? 'medium' : 'low';
    }

    // 🎯 Conversion probability
    calculateConversionProbability(analytics) {
        let probability = 0.1; // Base %10
        
        if (analytics?.behavior?.timeOnPage > 60) probability += 0.2;
        if (analytics?.behavior?.scrollDepth > 80) probability += 0.2;
        if (analytics?.device?.touchSupport === false) probability += 0.15; // PC
        if (analytics?.timing?.timezone === 'Europe/Istanbul') probability += 0.1;
        if (analytics?.marketing?.utmSource === 'facebook') probability += 0.15;
        
        return Math.min(probability, 0.9); // Max %90
    }
}

// Global instance
const fbPixelAdvanced = new FacebookPixelAdvanced();

// Global functions for form integration
window.trackFacebookFormSubmit = function(formData, analyticsData) {
    fbPixelAdvanced.trackFormSubmit(formData, analyticsData);
};

console.log('🚀 Facebook Pixel Advanced Analytics loaded');