import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { In, Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'core/database';
import { LoggerHelper } from 'core/common';
import { UserResult } from 'src/graphql/user/schema';
import UserRepository from 'src/core/database/repository/UserRepository';
@Injectable()
export class AuthService {
	private _repository: UserRepository
	constructor(

		private jwtService: JwtService, //@Inject(REQUEST) //private request,
	) {
		this._repository = new UserRepository(null)
	}

	async login(user: User) {
		const payload = { email: user.email };

		return {
			access_token: this.jwtService.sign(payload, {
				// keyid: 'test',
			}),
		};
	}
	getToken(user: User) {
		const payload = {
			email: user.email,
			docmentId: user.currentDoc?.document?.id,
		};
		return this.jwtService.sign(payload);
	}

	async findOne(
		email: string,
		documentId: string = null,
	): Promise<User | undefined> {
		let user = await this._repository.findOneByEmail(email);
		if (documentId)
			user.currentDoc = user.connect.find((x) => x.document?.id == documentId);
		return user;
	}

	async save(data: User) {
		// let user = this.userRepository.create(data);
		// return this.userRepository.save(user);
		return
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