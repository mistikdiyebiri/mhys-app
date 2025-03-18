// Bu dosya normalde AWS Amplify CLI tarafından otomatik olarak oluşturulur.
// Bu yapılandırma AWS Amplify'ı local mock mod'da çalıştırmak içindir.

const awsconfig = {
    // Amplify v6 ile uyumlu konfigürasyon (MOCK MODE)
    aws_project_region: 'us-east-1',
    Auth: {
        // Kimlik doğrulama sistemi mock modda çalışacak
        Cognito: {
            userPoolId: 'mock-user-pool-id',
            userPoolClientId: 'mock-client-id',
            signUpVerificationMethod: 'code', // 'code', 'link'
            loginWith: {
                email: true,
                phone: false,
                username: false
            }
        }
    }
};

export default awsconfig; 