import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { PrismaClientService } from '../database/prisma-client.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService, private prismaClientService: PrismaClientService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const payload = this.jwtService.verify(token);

        const user = await this.prismaClientService.user.findUnique({
          where: {
            id: payload.id,
          },
          include: {
            role: {
              select: {
                name: true,
                description: true,
                permissions: {
                  select: {
                    name: true,
                    description: true,
                    feature: true,
                  },
                },
              },
            }
          }
        });
        
        req['user'] = user;

        return next();
      } catch {
        throw new UnauthorizedException('Invalid token.');
      }
    }
    throw new UnauthorizedException('Invalid token.');
  }
}
