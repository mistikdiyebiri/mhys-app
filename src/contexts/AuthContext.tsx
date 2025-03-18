import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock Auth Types
interface MockUserAttributes {
  'given_name': string;
  'family_name': string;
  'custom:role': string;
  [key: string]: string;
}

interface MockUser {
  username: string;
  attributes: MockUserAttributes;
  [key: string]: any;
}

// CognitoUser tipi olarak MockUser kullan
export interface CognitoUser extends MockUser {}

// UserAttribute tipi güncellemesi
export type UserAttributes = Record<string, string>;

// Mock Auth metodlarının tipi
interface MockAuthMethods {
  signIn: (params: { username: string; password: string }) => Promise<{ isSignedIn: boolean; nextStep: { signInStep: string } }>;
  getCurrentUser: () => Promise<MockUser>;
  fetchUserAttributes: () => Promise<UserAttributes>;
  signOut: () => Promise<boolean>;
}

// Global window nesnesine eklediğimiz mock metodları için tip tanımı
declare global {
  interface Window { 
    mockAuthMethods: MockAuthMethods; 
  }
}

export interface AuthContextType {
  user: CognitoUser | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  userRole: string | null;
  currentUser?: CognitoUser | null;
  signOut?: () => Promise<void>;
  login: (email: string, password: string) => Promise<CognitoUser>;
  logout: () => Promise<void>;
  getUserAttributes: () => Promise<UserAttributes>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Kullanıcının oturum durumunu kontrol et
    const checkUser = async () => {
      try {
        // Mock metodları kullan
        const currentUser = await window.mockAuthMethods.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        
        // Kullanıcı rolünü al
        const userAttributes = await window.mockAuthMethods.fetchUserAttributes();
        const roleValue = userAttributes['custom:role'];
        setUserRole(roleValue || null);
      } catch (error) {
        // Hata durumunda kullanıcı bilgilerini temizle
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        console.log('Oturum kontrolü sırasında hata oluştu:', error);
      } finally {
        setIsAuthenticating(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      // Mock signIn metodunu kullan
      const { isSignedIn, nextStep } = await window.mockAuthMethods.signIn({ username: email, password });
      
      if (isSignedIn) {
        // Başarılı giriş
        try {
          const currentUser = await window.mockAuthMethods.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
          
          // Kullanıcı rolünü al
          const userAttributes = await window.mockAuthMethods.fetchUserAttributes();
          const roleValue = userAttributes['custom:role'];
          setUserRole(roleValue || null);
          
          return currentUser;
        } catch (error) {
          console.error('Kullanıcı bilgileri alınırken hata:', error);
          throw new Error('Giriş başarılı ancak kullanıcı bilgileri alınamadı');
        }
      } else {
        // MFA gibi ek adımlar gerekiyor
        throw new Error(`Kimlik doğrulama ek adım gerektiriyor: ${nextStep.signInStep}`);
      }
    } catch (error: any) {
      console.error('Giriş yapılırken hata:', error);
      
      // Hata mesajını doğrudan göster
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await window.mockAuthMethods.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
      throw error;
    }
  };

  const getUserAttributes = async (): Promise<UserAttributes> => {
    // Yeniden deneme mekanizması ile localStorage'dan doğrudan veri alma
    const maxRetries = 3;
    let retryCount = 0;
    
    // Kısa bir gecikme için fonksiyon
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    while (retryCount < maxRetries) {
      try {
        // Önce state'deki user'a bak
        if (user) {
          return await window.mockAuthMethods.fetchUserAttributes();
        }
        
        // User state'i boşsa localStorage'a doğrudan bak
        const savedUser = localStorage.getItem('mockCurrentUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && parsedUser.attributes) {
            // User state güncellenmemiş olsa bile localStorage'dan bilgileri alabiliyoruz
            return parsedUser.attributes;
          }
        }
        
        // Eğer hala bulunamadıysa biraz bekle ve tekrar dene
        await delay(500);
        retryCount++;
        
        if (retryCount === maxRetries) {
          throw new Error('Kullanıcı oturum açmamış');
        }
      } catch (error) {
        if (retryCount === maxRetries - 1) {
          console.error('Kullanıcı özellikleri alınırken hata oluştu:', error);
          throw error;
        }
        retryCount++;
        await delay(500);
      }
    }
    
    throw new Error('Kullanıcı oturum açmamış');
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated,
        isAuthenticating,
        userRole,
        login,
        logout,
        getUserAttributes,
        currentUser: user,
        signOut: logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 