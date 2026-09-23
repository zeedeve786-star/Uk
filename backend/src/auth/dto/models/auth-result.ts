import { Role } from '@prisma/client';

export interface AuthResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: Role;
  };
}
