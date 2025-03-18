import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// @ts-ignore
import { Amplify } from 'aws-amplify';
// Auth'u artık farklı şekilde tanımlayacağız
import awsExports from './aws-exports';
// Kendi AWS Amplify konfigürasyonumuzu içeri aktaralım
import configureAmplify from './amplify-config';
// DatePicker için gerekli bileşenler
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Locale import kaldırıldı

// Mock Auth için tip tanımları
interface UserAttributes {
  'given_name': string;
  'family_name': string;
  'custom:role': string;
  [key: string]: string;
}

interface MockUser {
  username: string;
  password: string;
  attributes: UserAttributes;
}

interface AuthUser extends MockUser {
  [key: string]: any;
}

// @ts-ignore - Amplify mock auth linter hatalarını yok sayıyoruz
// Amplify Mock Auth yapılandırması
// localhost:3000 için sabit kullanıcılar ve oturumların saklanması
const mockUserPoolId = 'mock-user-pool-id';
const mockUsers: Record<string, MockUser> = {
  'admin@mhys.com': {
    username: 'admin@mhys.com',
    password: 'Admin123!',
    attributes: {
      'given_name': 'Admin',
      'family_name': 'Kullanıcı',
      'custom:role': 'admin'
    }
  },
  'personel@mhys.com': {
    username: 'personel@mhys.com',
    password: 'Personel123!',
    attributes: {
      'given_name': 'Test',
      'family_name': 'Personel',
      'custom:role': 'employee'
    }
  },
  'musteri@firma.com': {
    username: 'musteri@firma.com',
    password: 'Musteri123!',
    attributes: {
      'given_name': 'Test',
      'family_name': 'Müşteri',
      'custom:role': 'customer'
    }
  }
};

// Mock Auth işlevselliği
let currentAuthUser: AuthUser | null = null;

// Auth istek tip tanımları
interface SignInRequest {
  username: string;
  password: string;
}

// Auth yanıt tip tanımları
interface SignInResponse {
  isSignedIn: boolean;
  nextStep: {
    signInStep: string;
  };
}

// Mock Auth fonksiyonlarını manuel olarak oluştur
const mockAuth = {
  signIn: async ({ username, password }: SignInRequest): Promise<SignInResponse> => {
    console.log('Mock SignIn:', username);
    const user = mockUsers[username];
    
    if (!user) {
      throw new Error('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
    }
    
    if (user.password !== password) {
      throw new Error('Hatalı şifre girdiniz');
    }
    
    // Başarılı giriş
    currentAuthUser = {
      ...user
    };
    
    localStorage.setItem('mockCurrentUser', JSON.stringify(currentAuthUser));
    
    return { isSignedIn: true, nextStep: { signInStep: 'DONE' } };
  },
  
  getCurrentUser: async (): Promise<AuthUser> => {
    console.log('Mock GetCurrentUser');
    
    const savedUser = localStorage.getItem('mockCurrentUser');
    if (savedUser) {
      currentAuthUser = JSON.parse(savedUser);
    }
    
    if (!currentAuthUser) {
      throw new Error('Oturum açık değil');
    }
    
    return currentAuthUser;
  },
  
  fetchUserAttributes: async (): Promise<UserAttributes> => {
    console.log('Mock FetchUserAttributes');
    
    if (!currentAuthUser) {
      throw new Error('Oturum açık değil');
    }
    
    return currentAuthUser.attributes;
  },
  
  signOut: async (): Promise<boolean> => {
    console.log('Mock SignOut');
    currentAuthUser = null;
    localStorage.removeItem('mockCurrentUser');
    return true;
  }
};

// Amplify yapılandırmasını yükle
if (process.env.NODE_ENV === 'production') {
  // Prodüksiyon ortamında gerçek Amplify konfigürasyonunu kullan
  console.log('Prodüksiyon modunda AWS Amplify yapılandırılıyor...');
  try {
    configureAmplify();
    console.log('Amplify yapılandırması başarılı!');
  } catch (error) {
    console.error('Amplify yapılandırma hatası:', error);
  }
} else {
  // Geliştirme ortamında mock konfigürasyonu kullan
  console.log('Geliştirme modunda AWS Amplify (mock) yapılandırılıyor...');
  try {
    console.log('aws-exports içeriği:', JSON.stringify(awsExports, null, 2));
    Amplify.configure(awsExports);
    console.log('Amplify mock yapılandırması başarılı!');
  } catch (error) {
    console.error('Amplify mock yapılandırma hatası:', error);
  }
}

// Global window nesnesine mock Auth metodlarını ekle
// Bu sayede tüm uygulamada bu metodlara erişilebilir
// @ts-ignore - TypeScript hatalarını görmezden geliyoruz
window.mockAuthMethods = mockAuth;

// AuthContext'de bu metodları kullanacağız

// Hata yakalama için genel bir error handler ekleyelim
window.addEventListener('error', (event) => {
  console.error('Global error handler:', event.error);
});

// Yakalanmayan Promise hataları için handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise rejection:', event.reason);
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <App />
    </LocalizationProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();