import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { In, Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'core/database';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(user: any) {
    const payload = { email: user.email };

    return {
      access_token: this.jwtService.sign(payload, {
        // keyid: 'test',
      }),
    };
  }
  async save(data: User) {
    let user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }
  async findOne(email: string): Promise<User | undefined> {
    let user = await this.userRepository.findOne({
      where: { email: email },
      select: { password: true, id: true, name: true, email: true },
    });
    return user;
  }
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.findOne(email);
    if (user && user.checkPassword(pass)) {
      return user;
    }
    return null;
  }
}
