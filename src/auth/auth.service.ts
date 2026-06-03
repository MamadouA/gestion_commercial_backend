import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientService } from '../database/prisma-client.service';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private prismaClientService: PrismaClientService) {}

    // -
    authenticate() {

    }

    // -
    generateJwTToken() {

    }

    // -
    verifyJwTToken() {

    }
}
