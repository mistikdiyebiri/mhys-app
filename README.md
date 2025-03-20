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

# MHYS E-posta Tabanlı Destek Sistemi

## Genel Bakış

Bu sistem, MHYS uygulamasına e-posta tabanlı bir destek ticket sistemi entegre eder. Müşteriler belirlenmiş e-posta adreslerine gönderdikleri e-postalar ile otomatik olarak ticket oluşturabilir, ve bu ticketlara gelen yanıtlar e-posta olarak alabilirler.

## Sistem Bileşenleri

1. **E-posta Ayarları Sayfası**: Admin panelinde e-posta ayarlarını yönetmek için bir arayüz.
2. **AWS Amplify Entegrasyonu**: E-postaları işlemek için Lambda fonksiyonları ve SES konfigürasyonu.
3. **Ticket<->E-posta Entegrasyonu**: Ticketlar ve e-postalar arasında çift yönlü iletişim.

## Kurulum Adımları

### 1. AWS SES (Simple Email Service) Kurulumu

1. AWS konsolunda SES servisine gidin.
2. İlgili domainlerinizi veya e-posta adreslerinizi doğrulayın.
3. Rule Set oluşturun ve aşağıdaki eylemleri ekleyin:
   - Gelen e-postayı S3 bucket'a kaydet
   - Lambda fonksiyonunu tetikle

### 2. AWS Amplify Kurulum ve Konfigürasyon

```bash
# Amplify CLI'ı yükleyin (eğer yoksa)
npm install -g @aws-amplify/cli

# Amplify projesini başlatın
amplify init

# E-posta işleme fonksiyonu ekleyin
amplify add function
# Sorulara şu şekilde yanıt verin:
# - Function name: processEmailToTicket
# - Runtime: NodeJS
# - Template: Hello World

# Depolama ekleyin (e-posta ve ekler için)
amplify add storage
# Sorulara şu şekilde yanıt verin:
# - Service: S3
# - Bucket name: mhys-emails
# - Access: Auth and guest users

# Değişiklikleri uygulayın
amplify push
```

### 3. Uygulamaya Entegrasyon

Aşağıdaki bileşenler sisteme eklenmiştir:

1. **E-posta Ayarları Sayfası**: `/admin/email-settings`
2. **E-posta Servis Katmanı**: `src/services/EmailService.ts`
3. **Ticket Detay Görünümünde E-posta Bilgileri**: Ticket e-posta ile oluşturulduysa e-posta bilgileri gösterilir
4. **E-posta Yanıtlama Özelliği**: Ticket yanıtları e-posta olarak da gönderilebilir

## Kullanım

### 1. E-posta Yapılandırması

1. Admin olarak giriş yapın
2. "E-posta Ayarları" menüsüne gidin
3. "Yeni E-posta Ekle" butonu ile e-posta yapılandırması ekleyin:
   - E-posta adresi (örn: destek@pazmanya.com)
   - Açıklama
   - Departman (Genel, Teknik, Satış vb.)
   - Aktif/Pasif durumu

### 2. E-posta ile Ticket Oluşturma

Müşteriler sistemde yapılandırılmış herhangi bir e-posta adresine mail göndererek otomatik ticket oluşturabilirler:

1. Müşteri `destek@pazmanya.com` adresine e-posta gönderir
2. Sistem e-postayı alır ve S3'e kaydeder
3. Lambda fonksiyonu tetiklenir ve e-postayı işler
4. Yeni bir ticket oluşturulur ve DynamoDB'ye kaydedilir

### 3. E-posta Olarak Yanıt Gönderme

1. Admin panelinde ticket detaylarını görüntüleyin
2. Yanıt oluştururken "E-posta Olarak da Gönder" seçeneğini işaretleyin
3. Gönder butonuna tıklayın
4. Sistem yanıtı hem ticket'a ekler hem de e-posta olarak müşteriye gönderir

## Güvenlik Önerileri

1. AWS SES sandbox modundan çıkış için AWS desteğine başvurun
2. E-posta filtreleme için SES gelen kutusu kurallarını yapılandırın
3. DKIM ve SPF kayıtlarını yapılandırın
4. Admin arayüzüne erişimi kısıtlayın

## Troubleshooting

1. **E-posta gönderme sorunları**: AWS SES kontrol panelinde gönderim istatistiklerini kontrol edin
2. **Lambda hataları**: CloudWatch Logs'ta Lambda fonksiyonu loglarını inceleyin
3. **S3 erişim sorunları**: Bucket izinlerini kontrol edin
