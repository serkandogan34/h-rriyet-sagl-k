/* DÖNÜŞÜM OPTİMİZASYONU JavaScript */

// Scroll to form function
function scrollToForm() {
    const form = document.getElementById('orderForm');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Form'a focus ekle
        setTimeout(() => {
            const firstInput = form.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 500);
    }
}

// Close exit popup
function closeExitPopup() {
    document.getElementById('exitPopup').style.display = 'none';
}

// Scroll to form and close popup
function scrollToFormAndClose() {
    closeExitPopup();
    scrollToForm();
}

// Show sticky CTA on scroll
window.addEventListener('scroll', function() {
    const stickyCTA = document.getElementById('stickyCTA');
    const formSection = document.querySelector('.order-form-section');
    
    if (formSection) {
        const formPosition = formSection.getBoundingClientRect().top;
        
        // Form görünür değilse sticky CTA'yı göster
        if (window.scrollY > 500 && formPosition > window.innerHeight) {
            stickyCTA.style.display = 'block';
        } else {
            stickyCTA.style.display = 'none';
        }
    }
});

// Exit intent detection
let exitIntentShown = false;
document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 0 && !exitIntentShown) {
        exitIntentShown = true;
        document.getElementById('exitPopup').style.display = 'flex';
        
        // Exit popup timer
        startExitTimer();
    }
});

// Exit popup countdown
function startExitTimer() {
    let minutes = 14;
    let seconds = 32;
    
    const timer = setInterval(() => {
        seconds--;
        
        if (seconds < 0) {
            minutes--;
            seconds = 59;
        }
        
        if (minutes < 0) {
            clearInterval(timer);
            minutes = 0;
            seconds = 0;
        }
        
        document.getElementById('exitMinutes').textContent = minutes;
        document.getElementById('exitSeconds').textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// Floating notifications
const sampleNotifications = [
    { name: 'Ayşe K.', city: 'İstanbul', time: '2 dakika önce' },
    { name: 'Mehmet Y.', city: 'Ankara', time: '5 dakika önce' },
    { name: 'Fatma D.', city: 'İzmir', time: '7 dakika önce' },
    { name: 'Ali R.', city: 'Bursa', time: '12 dakika önce' },
    { name: 'Zeynep S.', city: 'Antalya', time: '15 dakika önce' },
    { name: 'Mustafa K.', city: 'Adana', time: '18 dakika önce' },
    { name: 'Emine A.', city: 'Konya', time: '22 dakika önce' },
    { name: 'Hasan B.', city: 'Gaziantep', time: '25 dakika önce' }
];

function showRandomNotification() {
    const notification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
    const container = document.getElementById('notificationContainer');
    
    if (!container) return;
    
    const notificationEl = document.createElement('div');
    notificationEl.className = 'notification-item';
    notificationEl.innerHTML = `
        <div class="notification-avatar">${notification.name.charAt(0)}</div>
        <div class="notification-content">
            <div class="notification-name">${notification.name}</div>
            <div class="notification-action">${notification.city} - Sipariş verdi</div>
            <div class="notification-time">${notification.time}</div>
        </div>
    `;
    
    container.appendChild(notificationEl);
    
    // 5 saniye sonra kaldır
    setTimeout(() => {
        notificationEl.style.animation = 'slideOutLeft 0.5s ease-out';
        setTimeout(() => {
            notificationEl.remove();
        }, 500);
    }, 5000);
}

// CSS animation for slideOutLeft
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
    @keyframes slideOutLeft {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(-100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(slideOutStyle);

// Her 8-15 saniyede bir bildirim göster
setInterval(() => {
    if (Math.random() > 0.3) { // %70 şans
        showRandomNotification();
    }
}, Math.random() * 7000 + 8000);

// Active viewers counter (simulate)
function updateActiveViewers() {
    const viewersEl = document.getElementById('activeViewers');
    if (viewersEl) {
        const baseViewers = 230;
        const randomVariation = Math.floor(Math.random() * 30);
        viewersEl.textContent = baseViewers + randomVariation;
    }
}

setInterval(updateActiveViewers, 5000);

// Stock counter decreasing
function updateStockCounter() {
    const stockElements = document.querySelectorAll('.stock-number-inline, #stockLeft');
    stockElements.forEach(el => {
        let currentStock = parseInt(el.textContent);
        if (currentStock > 350 && Math.random() > 0.7) {
            currentStock--;
            el.textContent = currentStock;
        }
    });
}

setInterval(updateStockCounter, 20000); // Her 20 saniyede bir

// Mobile detection
function isMobile() {
    return window.innerWidth <= 768;
}

// Show mobile sticky footer on scroll (only on mobile)
if (isMobile()) {
    window.addEventListener('scroll', function() {
        const mobileFooter = document.getElementById('mobileStickyFooter');
        const formSection = document.querySelector('.order-form-section');
        
        if (formSection) {
            const formPosition = formSection.getBoundingClientRect().top;
            
            if (window.scrollY > 300 && formPosition > window.innerHeight) {
                mobileFooter.style.display = 'block';
            } else {
                mobileFooter.style.display = 'none';
            }
        }
    });
}

// Total orders incrementing
function incrementTotalOrders() {
    const ordersEl = document.getElementById('totalOrders');
    if (ordersEl) {
        let currentOrders = parseInt(ordersEl.textContent.replace(/,/g, ''));
        if (Math.random() > 0.6) { // %40 şans
            currentOrders++;
            ordersEl.textContent = currentOrders.toLocaleString('tr-TR');
        }
    }
}

setInterval(incrementTotalOrders, 30000); // Her 30 saniyede bir

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dönüşüm optimizasyonu aktif!');
    
    // İlk bildirimi 5 saniye sonra göster
    setTimeout(() => {
        showRandomNotification();
    }, 5000);
    
    // İlk active viewers update
    updateActiveViewers();
});

// Prevent exit popup from showing multiple times
let exitPopupDismissed = false;
document.getElementById('exitPopup')?.addEventListener('click', function(e) {
    if (e.target === this) {
        exitPopupDismissed = true;
        closeExitPopup();
    }
});

// Track scroll depth for analytics
let maxScrollDepth = 0;
window.addEventListener('scroll', function() {
    const scrollPercentage = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
    maxScrollDepth = Math.max(maxScrollDepth, Math.floor(scrollPercentage));
    
    // Scroll milestone tracking
    if (maxScrollDepth >= 25 && !window.scrollTracking?.milestone25) {
        window.scrollTracking = window.scrollTracking || {};
        window.scrollTracking.milestone25 = true;
        console.log('📊 Kullanıcı sayfanın %25\'ini gördü');
    }
    if (maxScrollDepth >= 50 && !window.scrollTracking?.milestone50) {
        window.scrollTracking.milestone50 = true;
        console.log('📊 Kullanıcı sayfanın %50\'sini gördü');
    }
    if (maxScrollDepth >= 75 && !window.scrollTracking?.milestone75) {
        window.scrollTracking.milestone75 = true;
        console.log('📊 Kullanıcı sayfanın %75\'ini gördü');
    }
    if (maxScrollDepth >= 90 && !window.scrollTracking?.milestone90) {
        window.scrollTracking.milestone90 = true;
        console.log('📊 Kullanıcı sayfanın %90\'ını gördü');
    }
});

// Form focus tracking
document.getElementById('orderForm')?.addEventListener('focus', function(e) {
    if (e.target.tagName === 'INPUT') {
        console.log('📝 Kullanıcı forma odaklandı:', e.target.id);
    }
}, true);

// Log conversion events
console.log(`
╔═══════════════════════════════════════════════╗
║  🎯 DÖNÜŞÜM OPTİMİZASYONU AKTİF             ║
║                                               ║
║  ✅ Sticky CTA Button                         ║
║  ✅ Exit Intent Popup                         ║
║  ✅ Floating Notifications                    ║
║  ✅ Social Proof Counters                     ║
║  ✅ Mobile Sticky Footer                      ║
║  ✅ Trust Badges                              ║
║  ✅ Enhanced Form                             ║
╚═══════════════════════════════════════════════╝
`);
