import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
  // Amplify yapılandırması
  const config: any = {
    Auth: {
      region: process.env.REACT_APP_AWS_REGION || 'eu-west-1',
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'your-user-pool-id',
      userPoolWebClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID || 'your-client-id',
      identityPoolId: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID,
    },
    API: {
      endpoints: [
        {
          name: 'tickets',
          endpoint: process.env.REACT_APP_API_ENDPOINT || 'https://api.example.com',
          region: process.env.REACT_APP_AWS_REGION || 'eu-west-1',
        }
      ]
    },
    Storage: {
      bucket: process.env.REACT_APP_S3_BUCKET || 'your-bucket-name',
      region: process.env.REACT_APP_AWS_REGION || 'eu-west-1',
    }
  };

  Amplify.configure(config);
};

export default configureAmplify; 