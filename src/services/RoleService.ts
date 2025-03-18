// RoleService.ts - Rol yönetimi için servis fonksiyonları
import { v4 as uuidv4 } from 'uuid';
import { Role, PagePermission, DefaultRoles, RoleFormData } from '../models/Role';

// Yerel depolama anahtar sabiti
const STORAGE_KEY = 'mhys_roles';

class RoleService {
  private roles: Role[] = [];
  
  constructor() {
    this.loadRoles();
  }
  
  // Rolleri yerel depolamadan yükle, eğer yoksa varsayılan rolleri kullan
  private loadRoles(): void {
    try {
      const savedRoles = localStorage.getItem(STORAGE_KEY);
      if (savedRoles) {
        this.roles = JSON.parse(savedRoles);
      } else {
        // Varsayılan rolleri ekle
        this.initializeDefaultRoles();
      }
    } catch (error) {
      console.error('Roller yüklenirken hata oluştu:', error);
      this.initializeDefaultRoles();
    }
  }
  
  // Varsayılan rolleri oluştur
  private initializeDefaultRoles(): void {
    const now = new Date().toISOString();
    this.roles = DefaultRoles.map(role => ({
      ...role,
      id: role.id || uuidv4(),
      name: role.name || '',
      permissions: role.permissions || [],
      createdAt: now,
      updatedAt: now
    })) as Role[];
    
    this.saveRoles();
  }
  
  // Rolleri yerel depolamaya kaydet
  private saveRoles(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.roles));
  }
  
  // Tüm rolleri getir
  getAllRoles(): Role[] {
    return [...this.roles];
  }
  
  // ID'ye göre rol getir
  getRoleById(id: string): Role | undefined {
    return this.roles.find(role => role.id === id);
  }
  
  // Yeni rol oluştur
  createRole(roleData: RoleFormData): Role {
    const now = new Date().toISOString();
    const newRole: Role = {
      id: uuidv4(),
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      createdAt: now,
      updatedAt: now
    };
    
    this.roles.push(newRole);
    this.saveRoles();
    return newRole;
  }
  
  // Rol güncelle
  updateRole(id: string, roleData: RoleFormData): Role | null {
    const index = this.roles.findIndex(role => role.id === id);
    if (index === -1) return null;
    
    const updatedRole: Role = {
      ...this.roles[index],
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      updatedAt: new Date().toISOString()
    };
    
    this.roles[index] = updatedRole;
    this.saveRoles();
    return updatedRole;
  }
  
  // Rol sil
  deleteRole(id: string): boolean {
    const role = this.getRoleById(id);
    if (!role || role.isSystem) return false;
    
    this.roles = this.roles.filter(role => role.id !== id);
    this.saveRoles();
    return true;
  }
  
  // Rolde izin var mı kontrol et
  hasPermission(roleId: string, permission: PagePermission): boolean {
    const role = this.getRoleById(roleId);
    if (!role) return false;
    
    return role.permissions.includes(permission);
  }
  
  // Rolün tüm izinlerini getir
  getRolePermissions(roleId: string): PagePermission[] {
    const role = this.getRoleById(roleId);
    if (!role) return [];
    
    return [...role.permissions];
  }
}

export const roleService = new RoleService();
export default roleService; 