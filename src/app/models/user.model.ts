export interface User {
  id: string;  // Изменено с number на string, так как Keycloak использует строковые ID
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  registrationDate: Date;
  telegramLink?: string;
  // Поле password удалено, так как оно не должно храниться на клиенте
}
