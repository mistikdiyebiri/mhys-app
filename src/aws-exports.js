// Bu dosya normalde AWS Amplify CLI tarafından otomatik olarak oluşturulur.
// Bu yapılandırma AWS Amplify'ı local mock mod'da çalıştırmak içindir.

const awsconfig = {
    aws_project_region: 'us-east-1',
    aws_cognito_region: 'us-east-1',
    aws_user_pools_id: 'mock-user-pool-id',
    aws_user_pools_web_client_id: 'mock-client-id'
};

export default awsconfig;