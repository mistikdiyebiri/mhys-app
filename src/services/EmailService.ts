import { v4 as uuidv4 } from 'uuid';

// Mock veriler - Gerçek API yerine
let mockEmailConfigurations = [
  {
    id: '1',
    email: 'destek@pazmanya.com',
    description: 'Ana destek e-postası',
    department: 'Genel',
    active: true,
    createdAt: '2023-04-05T10:00:00Z',
    updatedAt: null
  }
];

export interface EmailConfiguration {
  id: string;
  email: string;
  description?: string;
  department?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface EmailConfigurationResponse {
  success: boolean;
  emailConfigurations: EmailConfiguration[];
  message?: string;
}

export interface SingleEmailConfigurationResponse {
  success: boolean;
  emailConfiguration: EmailConfiguration | null;
  message?: string;
}

// E-posta yapılandırmalarını getir
export const getEmailConfigurations = async (): Promise<EmailConfigurationResponse> => {
  // Simüle edilen API gecikmesi
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    emailConfigurations: mockEmailConfigurations
  };
};

// Yeni e-posta yapılandırması oluştur
export const createEmailConfiguration = async (data: Omit<EmailConfiguration, 'id'>): Promise<SingleEmailConfigurationResponse> => {
  // Simüle edilen API gecikmesi
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newConfig: EmailConfiguration = {
    id: uuidv4(),
    ...data,
    // Undefined olabilecek alanlar için varsayılan değerler
    description: data.description || '',
    department: data.department || ''
  };
  
  mockEmailConfigurations.push(newConfig as any);
  
  return {
    success: true,
    emailConfiguration: newConfig,
    message: 'E-posta yapılandırması başarıyla oluşturuldu.'
  };
};

// E-posta yapılandırmasını güncelle
export const updateEmailConfiguration = async (data: Partial<EmailConfiguration> & { id: string }): Promise<SingleEmailConfigurationResponse> => {
  // Simüle edilen API gecikmesi
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockEmailConfigurations.findIndex(config => config.id === data.id);
  
  if (index === -1) {
    return {
      success: false,
      emailConfiguration: null,
      message: 'E-posta yapılandırması bulunamadı.'
    };
  }
  
  mockEmailConfigurations[index] = {
    ...mockEmailConfigurations[index],
    ...data,
    // null yerine string atanmış - updatedAt tipi aslında null olması gerekiyor
    updatedAt: new Date().toISOString() as any
  };
  
  return {
    success: true,
    emailConfiguration: mockEmailConfigurations[index],
    message: 'E-posta yapılandırması başarıyla güncellendi.'
  };
};

// E-posta yapılandırmasını sil
export const deleteEmailConfiguration = async (id: string): Promise<{ success: boolean; message: string }> => {
  // Simüle edilen API gecikmesi
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockEmailConfigurations.findIndex(config => config.id === id);
  
  if (index === -1) {
    return {
      success: false,
      message: 'E-posta yapılandırması bulunamadı.'
    };
  }
  
  mockEmailConfigurations = mockEmailConfigurations.filter(config => config.id !== id);
  
  return {
    success: true,
    message: 'E-posta yapılandırması başarıyla silindi.'
  };
}; 