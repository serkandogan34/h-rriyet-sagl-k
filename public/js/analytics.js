// Gelişmiş Kullanıcı Analitik Sistemi
class UserAnalytics {
    constructor() {
        this.pageLoadTime = Date.now();
        this.formStartTime = null;
        this.clickCount = 0;
        this.scrollDepth = 0;
        this.backspaceCount = 0;
        this.hesitationTime = 0;
        this.lastInputTime = null;
        this.fieldInteractions = {};
        
        this.init();
    }

    init() {
        this.trackClicks();
        this.trackScrolling();
        this.trackFormInteractions();
        this.detectTechnology();
    }

    // Tıklama davranışlarını takip et
    trackClicks() {
        document.addEventListener('click', (e) => {
            this.clickCount++;
            
            // Hangi elemana tıkladığını kaydet
            const elementInfo = {
                tag: e.target.tagName,
                class: e.target.className,
                id: e.target.id,
                text: e.target.innerText?.substring(0, 50)
            };
            
            console.log('Click tracked:', elementInfo);
        });
    }

    // Scroll davranışını takip et
    trackScrolling() {
        let maxScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (currentScroll > maxScroll) {
                maxScroll = currentScroll;
                this.scrollDepth = maxScroll;
            }
        });
    }

    // Form etkileşimlerini takip et
    trackFormInteractions() {
        const formFields = document.querySelectorAll('input, select, textarea');
        
        formFields.forEach(field => {
            // Form alanına odaklanma
            field.addEventListener('focus', (e) => {
                if (!this.formStartTime) {
                    this.formStartTime = Date.now();
                }
                
                this.fieldInteractions[e.target.id] = {
                    startTime: Date.now(),
                    focusCount: (this.fieldInteractions[e.target.id]?.focusCount || 0) + 1
                };
            });

            // Tuş basma (backspace tespiti)
            field.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    this.backspaceCount++;
                }
                
                // Tereddüt zamanı hesaplama
                const now = Date.now();
                if (this.lastInputTime && (now - this.lastInputTime > 3000)) {
                    this.hesitationTime += now - this.lastInputTime;
                }
                this.lastInputTime = now;
            });
        });
    }

    // Teknoloji tespiti
    detectTechnology() {
        return {
            // Tarayıcı kapasiteleri
            capabilities: {
                localStorage: typeof(Storage) !== "undefined",
                sessionStorage: typeof(sessionStorage) !== "undefined",
                webGL: !!window.WebGLRenderingContext,
                canvas: !!document.createElement('canvas').getContext,
                webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
                notifications: "Notification" in window,
                geolocation: "geolocation" in navigator
            },

            // Güvenlik bilgileri
            security: {
                doNotTrack: navigator.doNotTrack === "1",
                cookiesEnabled: navigator.cookieEnabled,
                javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false
            }
        };
    }

    // Cihaz parmak izi oluştur
    generateFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint test', 2, 2);
        
        return {
            screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            canvasFingerprint: canvas.toDataURL().slice(-50), // Son 50 karakter
            plugins: Array.from(navigator.plugins).map(p => p.name).join(','),
            fonts: this.detectFonts()
        };
    }

    // Font tespiti
    detectFonts() {
        const testFonts = ['Arial', 'Helvetica', 'Times', 'Courier', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Impact'];
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const detected = [];

        const testDiv = document.createElement('div');
        testDiv.style.position = 'absolute';
        testDiv.style.left = '-9999px';
        testDiv.style.fontSize = '72px';
        testDiv.innerHTML = 'mmmmmmmmmmlli';
        document.body.appendChild(testDiv);

        testFonts.forEach(font => {
            testDiv.style.fontFamily = font + ',' + baseFonts[0];
            const width1 = testDiv.offsetWidth;
            testDiv.style.fontFamily = font + ',' + baseFonts[1];
            const width2 = testDiv.offsetWidth;
            if (width1 !== width2) {
                detected.push(font);
            }
        });

        document.body.removeChild(testDiv);
        return detected.join(',');
    }

    // Tüm bilgileri topla
    collectAllData() {
        return {
            // Temel form verileri (mevcut)
            basicInfo: {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                pageUrl: window.location.href,
                referrer: document.referrer
            },

            // Cihaz bilgileri
            device: {
                screen: {
                    width: screen.width,
                    height: screen.height,
                    availWidth: screen.availWidth,
                    availHeight: screen.availHeight,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth,
                    devicePixelRatio: window.devicePixelRatio || 1
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                orientation: screen.orientation ? screen.orientation.angle : 0,
                touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
            },

            // Tarayıcı bilgileri
            browser: {
                language: navigator.language,
                languages: navigator.languages?.join(',') || navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack,
                onLine: navigator.onLine,
                connection: navigator.connection ? {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt,
                    saveData: navigator.connection.saveData
                } : null
            },

            // Davranış bilgileri
            behavior: {
                timeOnPage: Math.round((Date.now() - this.pageLoadTime) / 1000),
                formFillTime: this.formStartTime ? Math.round((Date.now() - this.formStartTime) / 1000) : 0,
                scrollDepth: this.scrollDepth,
                clickCount: this.clickCount,
                backspaceCount: this.backspaceCount,
                hesitationTime: Math.round(this.hesitationTime / 1000),
                fieldInteractions: this.fieldInteractions
            },

            // Teknoloji ve güvenlik
            technical: this.detectTechnology(),
            
            // Cihaz parmak izi
            fingerprint: this.generateFingerprint(),

            // Zaman bilgileri
            timing: {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timezoneOffset: new Date().getTimezoneOffset(),
                localTime: new Date().toLocaleString()
            },

            // URL parametreleri (pazarlama)
            marketing: {
                utmSource: new URLSearchParams(window.location.search).get('utm_source'),
                utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
                utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign'),
                utmTerm: new URLSearchParams(window.location.search).get('utm_term'),
                utmContent: new URLSearchParams(window.location.search).get('utm_content'),
                fbclid: new URLSearchParams(window.location.search).get('fbclid'),
                gclid: new URLSearchParams(window.location.search).get('gclid')
            }
        };
    }
}

// Global analytics instance
const userAnalytics = new UserAnalytics();

// Form submit olduğunda tüm verileri gönder
function getAnalyticsData() {
    return userAnalytics.collectAllData();
}

console.log('📊 Advanced Analytics loaded');