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

    user.password = "";
    const token = await this.generateJwTToken(user);
    return { user, token};
  }

  // -
  async generateJwTToken(user: User) {
    return await this.jwtService.signAsync(user);
  }

  // -
  verifyJwTToken() {}
}
