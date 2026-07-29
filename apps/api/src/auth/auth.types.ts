import { Request } from 'express';

export interface JwtClaims {
  sub: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  auth: JwtClaims;
}
