<<<<<<< HEAD
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
=======
# MHYS - Müşteri Hizmetleri Yönetim Sistemi

Bu proje, müşteri hizmetleri süreçlerini yönetmek için geliştirilmiş bir web uygulamasıdır.

## Özellikler

- Müşteri destek taleplerinin takibi
- Personel ve admin rolleri için ayrı panel
- Müşteriler için özel portal
- AWS Amplify ile authentication
- Mock mod ile geliştirme kolaylığı

## Geliştirme Ortamı

Projeyi geliştirme ortamında çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm start
```

Uygulama varsayılan olarak http://localhost:3000 adresinde çalışacaktır.

## AWS Amplify Deployment

Bu proje AWS Amplify ile deploy edilmek üzere yapılandırılmıştır.

### Deploy Adımları

1. GitHub reposunu AWS Amplify'a bağlayın
2. Build ayarlarında `amplify.yml` dosyasını seçin
3. Deploy tuşuna basın

### Mock Kimlik Doğrulama

Geliştirme aşamasında, gerçek AWS Cognito yerine mock kimlik doğrulama kullanılmaktadır. Aşağıdaki test kullanıcılarıyla giriş yapabilirsiniz:

- **Admin:** Email: admin@mhys.com, Şifre: Admin123!
- **Personel:** Email: personel@mhys.com, Şifre: Personel123!
- **Müşteri:** Email: musteri@firma.com, Şifre: Musteri123!

## Not

Uygulamanın gerçek bir AWS Cognito entegrasyonu için `src/aws-exports.js` dosyasındaki yapılandırmayı gerçek AWS kimlik bilgileriyle değiştirmeniz gerekir.
>>>>>>> 3f01a75bd9bfaddb084189284105bf321f1d0d9c
