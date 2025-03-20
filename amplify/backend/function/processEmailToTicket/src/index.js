const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const simpleParser = require('mailparser').simpleParser;

/**
 * E-posta mesajlarını işleyip bilet (ticket) oluşturan Lambda fonksiyonu
 * 
 * Olay kaynağı: SES e-posta alma kuralı
 * Nasıl çalışır:
 * 1. SES bir e-posta aldığında, S3'e kaydeder ve bu Lambda fonksiyonunu tetikler
 * 2. Lambda, e-postayı S3'ten alır ve içeriğini ayrıştırır
 * 3. E-posta bilgilerine göre yeni bir ticket oluşturur ve DynamoDB'ye kaydeder
 * 4. İlgili departmana otomatik atama yapılabilir
 */
exports.handler = async (event) => {
  try {
    console.log('İşlenen olay:', JSON.stringify(event, null, 2));
    
    // SES olayından e-posta verilerini çıkar
    const sesNotification = event.Records[0].ses;
    const messageId = sesNotification.mail.messageId;
    
    console.log(`İşlenen e-posta ID: ${messageId}`);
    
    // S3'ten e-posta içeriğini al
    const emailData = await s3.getObject({
      Bucket: process.env.EMAIL_BUCKET,
      Key: `emails/${messageId}`
    }).promise();
    
    // E-posta içeriğini parse et
    const email = await simpleParser(emailData.Body);
    
    console.log('E-posta bilgileri:', {
      from: email.from.text,
      to: email.to.text,
      subject: email.subject,
      hasAttachments: email.attachments.length > 0
    });
    
    // Önce e-posta yapılandırmalarını kontrol et
    const emailConfigs = await getEmailConfigurations();
    
    // E-posta alıcısına göre departman belirleme
    const toAddress = email.to.text.toLowerCase();
    let department = 'GENERAL';
    let isConfiguredEmail = false;
    
    // Yapılandırılmış e-postalar arasında eşleşme ara
    for (const config of emailConfigs) {
      if (config.active && toAddress.includes(config.email.toLowerCase())) {
        department = config.department ? config.department.toUpperCase() : 'GENERAL';
        isConfiguredEmail = true;
        break;
      }
    }
    
    // Yapılandırılmış e-posta bulunamadıysa, basit keyword kontrolü yap
    if (!isConfiguredEmail) {
      if (toAddress.includes('teknik')) {
        department = 'TECHNICAL';
      } else if (toAddress.includes('fatura')) {
        department = 'BILLING';
      } else if (toAddress.includes('satis')) {
        department = 'ACCOUNT';
      }
    }
    
    // E-postadan göndereni çıkar
    const fromAddress = email.from.text.match(/<([^>]+)>/) ? 
      email.from.text.match(/<([^>]+)>/)[1] : 
      email.from.text.trim();
    
    // Ekleri kaydet (varsa)
    const attachmentUrls = [];
    
    if (email.attachments && email.attachments.length > 0) {
      for (const attachment of email.attachments) {
        const fileName = attachment.filename;
        const s3Key = `attachments/${messageId}/${fileName}`;
        
        await s3.putObject({
          Bucket: process.env.EMAIL_BUCKET,
          Key: s3Key,
          Body: attachment.content,
          ContentType: attachment.contentType
        }).promise();
        
        attachmentUrls.push(`https://${process.env.EMAIL_BUCKET}.s3.amazonaws.com/${s3Key}`);
      }
    }
    
    // Ticket oluştur
    const ticketId = `ticket-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    
    const ticket = {
      id: ticketId,
      title: email.subject || 'Konu belirtilmemiş',
      description: email.html || email.text || '',
      status: 'open',
      priority: 'medium',
      category: department.toLowerCase(),
      createdBy: 'guest',
      assignedTo: null,
      createdAt: now,
      updatedAt: now,
      closedAt: null,
      attachments: attachmentUrls,
      metadata: {
        fromEmail: fromAddress,
        toEmail: toAddress,
        isFromEmail: true,
        messageId: messageId
      }
    };
    
    // Ticket'ı DynamoDB'ye kaydet
    await dynamoDB.put({
      TableName: process.env.TICKETS_TABLE,
      Item: ticket
    }).promise();
    
    console.log(`Ticket oluşturuldu, ID: ${ticketId}`);
    
    // Mutluluk içinde bitir
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'E-posta başarıyla bilete dönüştürüldü',
        ticketId: ticketId
      })
    };
  } catch (error) {
    console.error('E-posta işlenirken hata oluştu:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'E-posta işlenirken bir hata oluştu',
        error: error.message
      })
    };
  }
};

/**
 * DynamoDB'den e-posta yapılandırmalarını alır
 */
async function getEmailConfigurations() {
  try {
    const result = await dynamoDB.scan({
      TableName: process.env.EMAIL_CONFIGS_TABLE || 'EmailConfigurations'
    }).promise();
    
    return result.Items || [];
  } catch (error) {
    console.error('E-posta yapılandırmaları alınırken hata oluştu:', error);
    return [];
  }
} 