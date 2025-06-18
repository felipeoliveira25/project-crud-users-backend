import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthPayloadDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async validateUser(authPayloadDto: AuthPayloadDto) {
    const { username, password } = authPayloadDto;

    const admin = await this.prisma.admin.findUnique({
      where: {
        username,
      },
    });

    if (!admin) {
      return null;
    }

    if (password === admin.password) {
      console.log('🚀 ~ AuthService ~ validateUser ~ password:', password);
      const { password: _, ...adminData } = admin;

      return this.jwtService.sign(adminData);
    }

    return null;
  }
}
