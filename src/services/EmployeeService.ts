import { v4 as uuidv4 } from 'uuid';
import { Employee } from '../models/schema';

// Yerel depolama anahtarı
const EMPLOYEES_STORAGE_KEY = 'mhys_employees';

// Rol bazlı otomatik izinler
const rolePermissions: Record<string, string[]> = {
  'agent': ['view_tickets', 'create_tickets', 'edit_tickets'],
  'supervisor': ['view_tickets', 'create_tickets', 'edit_tickets', 'assign_tickets', 'view_reports', 'create_reports'],
  'manager': ['view_tickets', 'create_tickets', 'edit_tickets', 'delete_tickets', 'assign_tickets', 'view_reports', 'create_reports', 'manage_departments'],
  'admin': ['view_tickets', 'create_tickets', 'edit_tickets', 'delete_tickets', 'assign_tickets', 'view_reports', 'create_reports', 'manage_departments', 'manage_employees', 'view_dashboard', 'admin_panel']
};

// Örnek şifre hash'lemesi için kullanılacak basit fonksiyon
// Gerçek uygulamada daha güvenli bir çözüm kullanılmalıdır
const hashPassword = (password: string): string => {
  return btoa(password); // Bu basit bir örnek, üretimde daha güvenli bir yöntem kullanın
};

class EmployeeService {
  private employees: Employee[] = [];
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.loadEmployees();
    console.log('EmployeeService initialized', { isProduction: this.isProduction });
  }

  // Çalışanları localStorage'dan yükle
  private loadEmployees(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
        if (savedEmployees) {
          this.employees = JSON.parse(savedEmployees);
          console.log(`${this.employees.length} çalışan yüklendi`);
        } else {
          this.initializeSampleEmployees();
        }
      } catch (error) {
        console.error('Çalışanlar yüklenirken hata oluştu:', error);
        this.initializeSampleEmployees();
      }
    }
  }

  // Çalışanları localStorage'a kaydet
  private saveEmployees(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(this.employees));
      } catch (error) {
        console.error('Çalışanlar kaydedilirken hata oluştu:', error);
      }
    }
  }

  // Örnek çalışanlar yükle
  private initializeSampleEmployees(): void {
    const now = new Date().toISOString();
    this.employees = [
      { 
        id: '1', 
        firstName: 'Ali', 
        lastName: 'Yılmaz', 
        email: 'ali@example.com', 
        phone: '555-123-4567',
        departmentId: '1', 
        role: 'agent', 
        permissions: ['view_tickets', 'create_tickets', 'edit_tickets'],
        createdAt: now,
        updatedAt: now
      },
      { 
        id: '2', 
        firstName: 'Ayşe', 
        lastName: 'Demir', 
        email: 'ayse@example.com',
        phone: '555-234-5678', 
        departmentId: '2', 
        role: 'supervisor', 
        permissions: ['view_tickets', 'create_tickets', 'edit_tickets', 'assign_tickets', 'view_reports'],
        createdAt: now,
        updatedAt: now
      },
      { 
        id: '3', 
        firstName: 'Mehmet', 
        lastName: 'Kaya', 
        email: 'mehmet@example.com',
        phone: '555-345-6789', 
        departmentId: '1', 
        role: 'agent', 
        permissions: ['view_tickets', 'create_tickets'],
        createdAt: now,
        updatedAt: now
      },
      { 
        id: '4', 
        firstName: 'Zeynep', 
        lastName: 'Şahin', 
        email: 'zeynep@example.com',
        phone: '555-456-7890', 
        departmentId: '3', 
        role: 'manager', 
        permissions: ['view_tickets', 'create_tickets', 'edit_tickets', 'delete_tickets', 'assign_tickets', 'view_reports', 'create_reports', 'manage_departments'],
        createdAt: now,
        updatedAt: now
      },
      { 
        id: '5', 
        firstName: 'Mustafa', 
        lastName: 'Öztürk', 
        email: 'mustafa@example.com',
        phone: '555-567-8901', 
        departmentId: '2', 
        role: 'agent', 
        permissions: ['view_tickets', 'create_tickets', 'edit_tickets'],
        createdAt: now,
        updatedAt: now
      },
    ];
    this.saveEmployees();
  }

  // Tüm çalışanları getir
  getAllEmployees(): Employee[] {
    return [...this.employees];
  }

  // ID'ye göre çalışan getir
  getEmployeeById(id: string): Employee | undefined {
    return this.employees.find(emp => emp.id === id);
  }

  // Email ile çalışan getir
  getEmployeeByEmail(email: string): Employee | undefined {
    return this.employees.find(emp => emp.email === email);
  }

  // Yeni çalışan oluştur (şifre parametresiyle)
  createEmployee(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>, password: string): Employee {
    // Email zaten kullanılıyor mu kontrol et
    const existingEmployee = this.getEmployeeByEmail(employeeData.email);
    if (existingEmployee) {
      throw new Error(`${employeeData.email} email adresi zaten kullanılıyor.`);
    }

    const now = new Date().toISOString();
    const newEmployee: Employee = {
      id: uuidv4(),
      ...employeeData,
      createdAt: now,
      updatedAt: now
    };

    // Şifreyi mock bir kullanıcı kaydı olarak saklayabiliriz
    // Gerçek uygulamada, bu bir Auth servisine gitmeli
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`user_${newEmployee.email}`, JSON.stringify({
        email: newEmployee.email,
        passwordHash: hashPassword(password),
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        role: newEmployee.role
      }));
    }

    this.employees.push(newEmployee);
    this.saveEmployees();
    return newEmployee;
  }

  // Çalışan güncelle
  updateEmployee(id: string, employeeData: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>>): Employee | null {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) return null;

    // Email değişiyorsa ve yeni email kullanımdaysa hata ver
    if (employeeData.email && employeeData.email !== this.employees[index].email) {
      const existingEmployee = this.getEmployeeByEmail(employeeData.email);
      if (existingEmployee) {
        throw new Error(`${employeeData.email} email adresi zaten kullanılıyor.`);
      }
    }

    const updatedEmployee: Employee = {
      ...this.employees[index],
      ...employeeData,
      updatedAt: new Date().toISOString()
    };

    this.employees[index] = updatedEmployee;
    this.saveEmployees();
    return updatedEmployee;
  }

  // Çalışan sil
  deleteEmployee(id: string): boolean {
    const initialLength = this.employees.length;
    this.employees = this.employees.filter(emp => emp.id !== id);
    
    if (initialLength !== this.employees.length) {
      this.saveEmployees();
      return true;
    }
    return false;
  }

  // Çalışan şifresini güncelle
  updateEmployeePassword(id: string, newPassword: string): boolean {
    const employee = this.getEmployeeById(id);
    if (!employee) return false;

    // Şifreyi güncelleyelim (mock)
    if (typeof window !== 'undefined' && window.localStorage) {
      const userDataKey = `user_${employee.email}`;
      const userData = localStorage.getItem(userDataKey);
      
      if (userData) {
        const parsedData = JSON.parse(userData);
        parsedData.passwordHash = hashPassword(newPassword);
        localStorage.setItem(userDataKey, JSON.stringify(parsedData));
        return true;
      }
    }
    return false;
  }

  // Şifre sıfırlama bildirimi gönder (simülasyon)
  sendPasswordResetLink(email: string): boolean {
    const employee = this.getEmployeeByEmail(email);
    if (!employee) return false;
    
    // Gerçek uygulamada, burası bir e-posta göndermeli
    console.log(`${email} adresine şifre sıfırlama bağlantısı gönderildi (simülasyon)`);
    
    // Simülasyon amaçlı, geçici bir şifre oluştur ve göster
    const tempPassword = `temp${Math.floor(Math.random() * 10000)}`;
    console.log(`Geçici şifre: ${tempPassword}`);
    
    // Geçici şifreyi kullanıcı verilerine kaydedelim
    this.updateEmployeePassword(employee.id, tempPassword);
    
    return true;
  }
}

export const employeeService = new EmployeeService();
export default employeeService; 