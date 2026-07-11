import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientService } from '../database/prisma-client.service';
import { SignInDto } from './dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaClientService: PrismaClientService,
  ) {}

  // -
  async authenticate(signInDto: SignInDto) {
    const user = await this.prismaClientService.user.findUnique({
      where: {
        email: signInDto.email,
      },
    });
    if (!(user && bcrypt.compareSync(signInDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { id: user.id, email: user.email, fullname: user.fullname, roles: user.roles };

    const token = await this.generateJwTToken(payload);
    return { user: payload, token};
  }

  // -
  async generateJwTToken(user: Partial<User>) {
    return await this.jwtService.signAsync(user);
  }

  // -
  verifyJwTToken() {}
}
