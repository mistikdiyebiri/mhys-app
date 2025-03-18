# MHYS - Müşteri Hizmet Yönetim Sistemi

Bu proje, müşteri hizmetleri yönetim sistemi olarak geliştirilmiştir. Sistem, müşteri sorunlarını takip etme, çözme ve raporlama yeteneklerine sahiptir.

## Özellikler

- **Çoklu Kullanıcı Tipi**: Admin, personel ve müşteri rollerine göre farklı yetkiler
- **Responsive Tasarım**: Mobil ve masaüstü kullanımı için optimize edilmiş arayüz
- **AWS Amplify Entegrasyonu**: Kimlik doğrulama ve veritabanı işlemleri için AWS altyapısı

## Geliştirme Ortamı

Geliştirme için aşağıdaki komutları kullanabilirsiniz:

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start

# Test'leri çalıştır
npm test

# Üretim için build al
npm run build
```

## Mock Kullanıcılar

Test amacıyla aşağıdaki kullanıcıları kullanabilirsiniz:

- **Admin**: 
  - E-posta: `admin@mhys.com`
  - Şifre: `Admin123!`

- **Personel**: 
  - E-posta: `personel@mhys.com`
  - Şifre: `Personel123!`

- **Müşteri**: 
  - E-posta: `musteri@firma.com`
  - Şifre: `Musteri123!`

## AWS Amplify Deployment

Projeyi AWS Amplify'a yüklemek için:

1. AWS Management Console'da Amplify servisini açın
2. "New app" > "Host web app" seçin
3. GitHub'dan bu repo'yu seçin
4. Varsayılan build ayarlarını kullanın
5. Deploy tuşuna basın

Not: Gerçek bir uygulamada, `aws-exports.js` dosyasındaki mock değerler yerine gerçek AWS Cognito kimlik doğrulama bilgilerinizi kullanmanız gerekir.
