import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from '../users/users.service';

interface Register {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Payload {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  color: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(pass, user?.password))
    ) {
      throw new UnauthorizedException();
    }

    const payload: Payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      color: user.color,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(registerBody: Register) {
    return this.prisma.user.create({
      data: {
        email: registerBody.email,
        password: await bcrypt.hash(registerBody.password, 10),
        firstName: registerBody.firstName,
        lastName: registerBody.lastName,
      },
    });
  }
}
