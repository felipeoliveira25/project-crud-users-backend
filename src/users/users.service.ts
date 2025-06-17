import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(data: CreateUserDto) {
    const user = await this.prisma.users.create({
      data,
    });
    // Invalida o cache da lista de usuários
    await this.cacheManager.del('users_list');
    return user;
  }

  async findAll() {
    const cacheKey = 'users_list';
    const cachedUsers = await this.cacheManager.get(cacheKey);
    if (cachedUsers) {
      console.log('Retornando usuários do cache');
      return cachedUsers;
    }

    const users = await this.prisma.users.findMany();
    const ttl = this.configService.get<number>('CACHE_TTL', 60);
    await this.cacheManager.set(cacheKey, users, ttl);
    console.log('Retornando usuários do banco');
    return users;
  }

  async findOne(id: number) {
    const cacheKey = `user_${id}`;
    const cachedUser = await this.cacheManager.get(cacheKey);
    if (cachedUser) {
      console.log(`Retornando usuário ${id} do cache`);
      return cachedUser;
    }

    const user = await this.prisma.users.findUnique({
      where: { id },
    });
    if (user) {
      const ttl = this.configService.get<number>('CACHE_TTL', 60);
      await this.cacheManager.set(cacheKey, user, ttl);
    }
    console.log(`Retornando usuário ${id} do banco`);
    return user;
  }

  async update(id: number, data: UpdateUserDto) {
    const user = await this.prisma.users.update({
      where: { id },
      data,
    });
    // Invalida os caches da lista e do usuário específico
    await this.cacheManager.del('users_list');
    await this.cacheManager.del(`user_${id}`);
    return user;
  }

  async remove(id: number) {
    try {
      const user = await this.prisma.users.delete({
        where: { id },
      });
      // Invalida os caches da lista e do usuário específico
      await this.cacheManager.del('users_list');
      await this.cacheManager.del(`user_${id}`);
      return user;
    } catch {
      throw new Error('Usuário não encontrado');
    }
  }
}
