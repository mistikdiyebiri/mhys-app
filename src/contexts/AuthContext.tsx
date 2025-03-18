import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PagePermission } from '../models/Role';
import roleService from '../services/RoleService';

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
  userPermissions: PagePermission[];
  currentUser?: CognitoUser | null;
  signOut?: () => Promise<void>;
  login: (email: string, password: string) => Promise<CognitoUser>;
  logout: () => Promise<void>;
  getUserAttributes: () => Promise<UserAttributes>;
  hasPermission: (permission: PagePermission) => boolean;
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
  const [userPermissions, setUserPermissions] = useState<PagePermission[]>([]);

  // Kullanıcının izinlerini rol ID'sine göre yükle
  const loadUserPermissions = (roleId: string) => {
    if (roleId === 'admin') {
      // Admin rolü tüm izinlere sahiptir
      setUserPermissions(Object.values(PagePermission));
    } else {
      // Diğer roller için rol servisinden izinleri al
      const permissions = roleService.getRolePermissions(roleId);
      setUserPermissions(permissions);
    }
  };

  useEffect(() => {
    // Kullanıcının oturum durumunu kontrol et
    const checkUser = async () => {
      try {
        console.log('AuthContext: Kullanıcı oturum durumu kontrol ediliyor...');
        
        // window.mockAuthMethods var mı kontrol et
        if (!window.mockAuthMethods) {
          console.error('AuthContext: window.mockAuthMethods bulunamadı!');
          setIsAuthenticating(false);
          return;
        }
        
        // Mock metodları kullan
        const currentUser = await window.mockAuthMethods.getCurrentUser();
        console.log('AuthContext: Kullanıcı bulundu:', currentUser);
        setUser(currentUser);
        setIsAuthenticated(true);
        
        // Kullanıcı rolünü al
        const userAttributes = await window.mockAuthMethods.fetchUserAttributes();
        console.log('AuthContext: Kullanıcı özellikleri:', userAttributes);
        const roleValue = userAttributes['custom:role'];
        setUserRole(roleValue || null);
        
        // Kullanıcının izinlerini yükle
        if (roleValue) {
          console.log('AuthContext: Rol yükleniyor:', roleValue);
          loadUserPermissions(roleValue);
        }
      } catch (error) {
        // Hata durumunda kullanıcı bilgilerini temizle
        console.error('AuthContext: Oturum kontrolü sırasında hata oluştu:', error);
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserPermissions([]);
      } finally {
        setIsAuthenticating(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('AuthContext: Giriş yapılıyor...', email);
    setIsAuthenticating(true);
    try {
      // Mock signIn metodunu kullan
      console.log('AuthContext: Mock signIn çağrılıyor');
      const { isSignedIn, nextStep } = await window.mockAuthMethods.signIn({ username: email, password });
      console.log('AuthContext: Giriş sonucu:', { isSignedIn, nextStep });
      
      if (isSignedIn) {
        // Başarılı giriş
        try {
          console.log('AuthContext: Kullanıcı bilgileri alınıyor');
          const currentUser = await window.mockAuthMethods.getCurrentUser();
          console.log('AuthContext: Mevcut kullanıcı:', currentUser);
          setUser(currentUser);
          setIsAuthenticated(true);
          
          // Kullanıcı rolünü al
          const userAttributes = await window.mockAuthMethods.fetchUserAttributes();
          console.log('AuthContext: Kullanıcı özellikleri:', userAttributes);
          const roleValue = userAttributes['custom:role'];
          setUserRole(roleValue || null);
          
          // Kullanıcının izinlerini yükle
          if (roleValue) {
            console.log('AuthContext: Kullanıcı izinleri yükleniyor:', roleValue);
            loadUserPermissions(roleValue);
          }
          
          return currentUser;
        } catch (error) {
          console.error('AuthContext: Kullanıcı bilgileri alınırken hata:', error);
          throw new Error('Giriş başarılı ancak kullanıcı bilgileri alınamadı');
        }
      } else {
        // MFA gibi ek adımlar gerekiyor
        console.warn(`AuthContext: Kimlik doğrulama ek adım gerektiriyor: ${nextStep.signInStep}`);
        throw new Error(`Kimlik doğrulama ek adım gerektiriyor: ${nextStep.signInStep}`);
      }
    } catch (error: any) {
      console.error('AuthContext: Giriş yapılırken hata:', error);
      
      // Hata mesajını doğrudan göster
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    console.log('AuthContext: Çıkış yapılıyor...');
    try {
      await window.mockAuthMethods.signOut();
      console.log('AuthContext: Çıkış başarılı');
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setUserPermissions([]);
    } catch (error) {
      console.error('AuthContext: Çıkış yapılırken hata oluştu:', error);
      throw error;
    }
  };

  const getUserAttributes = async (): Promise<UserAttributes> => {
    console.log('AuthContext: Kullanıcı özellikleri isteniyor');
    // Yeniden deneme mekanizması ile localStorage'dan doğrudan veri alma
    const maxRetries = 3;
    let retryCount = 0;
    
    // Kısa bir gecikme için fonksiyon
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    while (retryCount < maxRetries) {
      try {
        // Önce state'deki user'a bak
        if (user) {
          console.log('AuthContext: State içindeki kullanıcıdan özellikler alınıyor');
          return await window.mockAuthMethods.fetchUserAttributes();
        }
        
        // User state'i boşsa localStorage'a doğrudan bak
        const savedUser = localStorage.getItem('mockCurrentUser');
        if (savedUser) {
          console.log('AuthContext: LocalStorage\'dan kullanıcı bilgileri alınıyor');
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && parsedUser.attributes) {
            // User state güncellenmemiş olsa bile localStorage'dan bilgileri alabiliyoruz
            return parsedUser.attributes;
          }
        }
        
        console.log(`AuthContext: Kullanıcı bilgileri bulunamadı, ${retryCount + 1}. deneme yapılıyor...`);
        // Eğer hala bulunamadıysa biraz bekle ve tekrar dene
        await delay(500);
        retryCount++;
        
        if (retryCount === maxRetries) {
          throw new Error('Kullanıcı oturum açmamış');
        }
      } catch (error) {
        console.warn(`AuthContext: Kullanıcı özellikleri alınırken hata, ${retryCount + 1}. deneme:`, error);
        if (retryCount === maxRetries - 1) {
          console.error('AuthContext: Tüm denemeler başarısız oldu, kullanıcı özellikleri alınamadı:', error);
          throw error;
        }
        retryCount++;
        await delay(500);
      }
    }
    
    console.error('AuthContext: Kullanıcı özellikleri alınamadı, kullanıcı oturum açmamış');
    throw new Error('Kullanıcı oturum açmamış');
  };

  // Kullanıcının belirli bir izne sahip olup olmadığını kontrol et
  const hasPermission = (permission: PagePermission): boolean => {
    // Admin her zaman tüm izinlere sahiptir
    if (userRole === 'admin') return true;
    
    // Diğer roller için izinleri kontrol et
    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated,
        isAuthenticating,
        userRole,
        userPermissions,
        login,
        logout,
        getUserAttributes,
        hasPermission,
        currentUser: user,
        signOut: logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};