export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  permissions?: Record<string, never>; // Or a specific type like UserPermissions
}