import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PublicUser } from '../users/users.types';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface LoginResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: Pick<PublicUser, 'id' | 'name' | 'email'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<PublicUser> {
    const rounds = this.configService.getOrThrow<number>('BCRYPT_ROUNDS');
    const passwordHash = await bcrypt.hash(dto.password, rounds);
    return this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = this.usersService.findInternalByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const expiresIn = this.configService.getOrThrow<number>('JWT_EXPIRES_IN');
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
