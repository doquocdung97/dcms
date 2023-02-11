import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { In, Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'core/database';
import { LoggerHelper } from 'core/common';
import { UserResult, ResultCode } from 'core/graphql/user';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService, //@Inject(REQUEST) //private request,
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
    let user = await this.userRepository.findOneBy({ email: email });
    return user;
  }
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.findOne(email);
    if (user && user.checkPassword(pass)) {
      return user;
    }
    return null;
  }
  ValidateToken(token: string) {
    try {
      this.jwtService.verify(token);
      return true;
    } catch (error) {
      return error.name;
    }
  }
}

@Injectable()
export class UserService {
  private logger = new LoggerHelper('UserService');
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(REQUEST) private request,
  ) {}

  async create(data: User): Promise<UserResult> {
    let new_user = this.userRepository.create(data);
    let result = new UserResult();
    try {
      let user = await this.userRepository.findOneBy({ email: new_user.email });
      if (!user) {
        result.data = await this.userRepository.save(new_user);
      } else {
        result.success = false;
        result.code = ResultCode.B004;
      }
    } catch (ex) {
      this.logger.error(`Update failed.\n${ex}`);
      result.success = false;
      result.code = ResultCode.B001;
    }
    return result;
  }
  async update(data: User): Promise<UserResult> {
    let result = new UserResult();
    try {
      let user = User.getByRequest(this.request);
      if (user) {
        let userafter = Object.assign(user, data);
        let recore = await this.userRepository.save(
          this.userRepository.create(userafter),
        );
        if (recore) {
          result.data = recore;
        } else {
          result.success = false;
          result.code = ResultCode.B003;
        }
      } else {
        result.success = false;
        result.code = ResultCode.B002;
      }
    } catch (ex) {
      this.logger.error(`Update failed.\n${ex}`);
      result.success = false;
      result.code = ResultCode.B001;
    }
    return result; //this.userRepository.save(user);
  }
  async login(): Promise<UserResult> {
    let result = new UserResult();
    try {
      //let user = await this.userRepository.findOneBy({ email: new_user.email });
      //if (!user) {
      //  result.data = await this.userRepository.save(new_user);
      //} else {
      //  result.success = false;
      //  result.code = ResultCode.B004;
      //}
      let user = User.getByRequest(this.request);
      result.data = user;
    } catch (ex) {
      this.logger.error(`Login failed.\n${ex}`);
      result.success = false;
      result.code = ResultCode.B001;
    }
    return result;
  }
}
