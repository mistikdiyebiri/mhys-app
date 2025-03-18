import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
  // Amplify yapılandırması
  const config = {
    aws_project_region: process.env.REACT_APP_AWS_REGION || 'eu-west-1',
    aws_cognito_region: process.env.REACT_APP_AWS_REGION || 'eu-west-1',
    aws_user_pools_id: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'your-user-pool-id',
    aws_user_pools_web_client_id: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID || 'your-client-id',
    aws_appsync_graphqlEndpoint: process.env.REACT_APP_API_ENDPOINT || 'https://api.example.com',
    aws_appsync_region: process.env.REACT_APP_AWS_REGION || 'eu-west-1',
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    aws_user_files_s3_bucket: process.env.REACT_APP_S3_BUCKET || 'your-bucket-name',
    aws_user_files_s3_bucket_region: process.env.REACT_APP_AWS_REGION || 'eu-west-1'
  };

  console.log('Amplify yapılandırılıyor:', JSON.stringify(config, null, 2));
  Amplify.configure(config);
};

export default configureAmplify;