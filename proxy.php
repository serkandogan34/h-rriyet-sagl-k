<?php
// CORS Headers - Tarayıcı engellemelerini önle
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight OPTIONS request'i handle et
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Error reporting ve logging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Üretimde kapalı
ini_set('log_errors', 1);

// HEDEFLENEN GERÇEK BACKEND ADRESİ - OZPHYZEN siparişleri için
$targetUrl = "https://rowww4s04sc8o4gk04swgog4.dtekai.com/api/order";

try {
    // Tarayıcıdan gelen JSON verisini al ve PHP dizisine çevir
    $formData = file_get_contents('php://input');
    
    // JSON validation
    if (empty($formData)) {
        throw new Exception('Sipariş verisi alınamadı');
    }
    
    $data = json_decode($formData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Geçersiz veri formatı: ' . json_last_error_msg());
    }

    // Gerçek kullanıcı IP'sini en güvenilir sırayla bul
    $ipAddress = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? 
                 $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 
                 $_SERVER['HTTP_X_REAL_IP'] ??
                 $_SERVER['REMOTE_ADDR'];

    // X-Forwarded-For birden fazla IP içerebilir, ilkini al (gerçek kullanıcı IP'si)
    if (strpos($ipAddress, ',') !== false) {
        $ipAddress = trim(explode(',', $ipAddress)[0]);
    }

    // OZPHYZEN siparişine özel alanlar ekle
    if ($ipAddress) {
        $data['ip'] = $ipAddress; // 'customer_ip' yerine 'ip' kullan
        $data['customer_ip'] = $ipAddress; // Backward compatibility için
    }
    
    // Sipariş timestamp'i ekle
    $data['order_timestamp'] = date('Y-m-d H:i:s');
    
    // İsim alanlarını düzenle - webhook'un beklediği formatta
    if (isset($data['name']) && isset($data['surname'])) {
        $data['isim'] = $data['name'] . ' ' . $data['surname']; // Tam isim
        $data['firstName'] = $data['name']; // Ad
        $data['lastName'] = $data['surname']; // Soyad  
    }

    // Webhook için gerekli alanları ekle
    $data['siparisID'] = 'SIP-' . date('YmdHis'); // Sipariş ID
    $data['cihazBilgisi'] = $_SERVER['HTTP_USER_AGENT'] ?? 'Bilinmeyen';
    $data['gelenSite'] = $_SERVER['HTTP_REFERER'] ?? $_SERVER['HTTP_HOST'] ?? 'Direkt';
    $data['zamanDamgasi'] = date('c'); // ISO 8601 format
    $data['webhookUrl'] = 'https://n8nwork.dtekai.com/webhook/bc74f59e-54c2-4521-85a1-6e21a0438c31';
    $data['yürütmeModu'] = 'üretme';

    // Ürün bilgilerini standartlaştır
    $data['product_name'] = 'OZPHYZEN Ağrı Kremi';
    $data['campaign_source'] = 'hurriyet_interview';
    $data['doctor_reference'] = 'Prof. Dr. Mehmet Öz';
    
    // Türkiye saat dilimi
    date_default_timezone_set('Europe/Istanbul');
    $data['order_time_turkey'] = date('Y-m-d H:i:s');

    // Güncellenmiş sipariş verisini tekrar JSON formatına çevir
    $payloadToSend = json_encode($data, JSON_UNESCAPED_UNICODE);
    
    // Debug log (geliştirme amaçlı)
    error_log("📤 OZPHYZEN Sipariş Gönderiliyor: " . $payloadToSend);

    // Gerekli başlıkları ayarla
    $headers = [
        'Content-Type: application/json; charset=utf-8',
        'Content-Length: ' . strlen($payloadToSend),
        'Accept: application/json'
    ];
    
    // Tarayıcı bilgilerini aktar - gerçek kullanıcı bilgilerini koru
    if (isset($_SERVER['HTTP_USER_AGENT'])) {
        $headers[] = 'User-Agent: ' . $_SERVER['HTTP_USER_AGENT'];
    }
    if ($ipAddress && $ipAddress !== $_SERVER['REMOTE_ADDR']) {
        // Gerçek kullanıcı IP'sini forward et
        $headers[] = 'X-Forwarded-For: ' . $ipAddress;
        $headers[] = 'X-Real-IP: ' . $ipAddress;
        $headers[] = 'CF-Connecting-IP: ' . $ipAddress;
    }
    if (isset($_SERVER['HTTP_REFERER'])) {
        $headers[] = 'Referer: ' . $_SERVER['HTTP_REFERER'];
    }

    // cURL ile asıl backend'e siparişi gönder
    $ch = curl_init($targetUrl);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payloadToSend);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 45); // 45 saniye timeout (sipariş için daha uzun)
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15); // 15 saniye bağlantı timeout
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Redirect'leri takip et

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    // cURL hata kontrolü
    if ($response === false || !empty($curl_error)) {
        throw new Exception('Sipariş gönderilemedi: ' . $curl_error);
    }
    
    // Debug log
    error_log("📥 Backend Yanıt (HTTP $httpcode): " . substr($response, 0, 200));

    // Backend'den gelen yanıtı tarayıcıya geri gönder
    http_response_code($httpcode);
    header('Content-Type: application/json; charset=utf-8');
    echo $response;

} catch (Exception $e) {
    // Hata durumunda Türkçe JSON yanıt döndür
    error_log("❌ OZPHYZEN Sipariş Hatası: " . $e->getMessage());
    
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => 'Sipariş işlenirken hata oluştu: ' . $e->getMessage(),
        'message' => 'Lütfen tekrar deneyiniz veya müşteri hizmetlerini arayınız.',
        'timestamp' => date('Y-m-d H:i:s'),
        'support_phone' => '0850 XXX XX XX' // Gerçek destek numaranızı ekleyin
    ], JSON_UNESCAPED_UNICODE);
}
?>