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