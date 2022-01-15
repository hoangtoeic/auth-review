import { HttpException, Injectable } from '@nestjs/common';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto';
import { createQueryBuilder, getManager, getRepository } from 'typeorm';
import { User } from 'src/db/entities/user.entity';
import { EntityManager } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import { Token } from 'src/db/entities/token.entity';
import { Role } from 'src/db/entities/role.entity';
import { UserRole } from 'src/db/entities/user-role.entity';
import {
  RegisterResponse
} from './interface/registerResponse.interface';
import { RefreshTokenResponse } from './interface/refreshTokenResponse.interface';
import { LoginResponse } from './interface/loginResponse.interface';
import { setTimeRefreshTokenExpired, setTimeResetTokenExpired } from 'src/utils/dateTime';
import { passwordUtil } from 'src/utils/password';
import { UserData } from './interface/userData.interface';
import { ForgotPasswordResponse } from './interface/forgotPasswordResponse.interface';
import { ResetPasswordResponse } from './interface/resetPasswordResponse.interface';

const userPickFields = ['id', 'email', 'firstName', 'lastName'];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async createTokenAndRefreshToken({
    entityManager,
    payload,
    userId,
  }: {
    entityManager?: EntityManager;
    payload: any;
    userId: number;
  }) {
    const accessToken = this.jwtService.sign(payload);
    const query = entityManager
      ? entityManager.getRepository(Token)
      : getRepository(Token);
    const getOldRefreshToken = await query
      .createQueryBuilder('Token')
      .where('Token.userId = :userId', { userId })
      .andWhere('Token.refreshTokenExpired > :refreshTokenExpired', {
        refreshTokenExpired: new Date().toISOString(),
      })
      .getOne();
    const refreshToken = getOldRefreshToken
      ? getOldRefreshToken.refreshToken
      : nanoid(12);

    const refreshTokenExpired = getOldRefreshToken
      ? getOldRefreshToken.refreshTokenExpired
      : setTimeRefreshTokenExpired()
    return {
      accessToken,
      refreshToken,
      refreshTokenExpired,
    };
  }

  async register(payload: RegisterDto): Promise<RegisterResponse> {
    const { email, password, roleName } = payload;
    const checkExistedUser = await User.findOne({
      where: {
        email,
      },
    });
    delete payload.password;
    delete payload.roleName;

    if (checkExistedUser) {
      throw new HttpException('Email existed, please try again', 400);
    }

    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      throw new HttpException('Role not found, please try again', 404);
    }

    return await getManager().transaction(async (entityManager) => {
  
      const passwordHash =await passwordUtil.generateHash(password);
      const userInsert = await entityManager.getRepository(User).save(
        User.create({
          ...payload,
          password: passwordHash,
        }),
      );

      const userRole = await entityManager.getRepository(UserRole).save(
        UserRole.create({
          userId: userInsert.id,
          roleId: role.id,
        }),
      );
      const userData: UserData = {
        ..._.pick(userInsert, userPickFields),
        scope: role.name,
      };
      const { accessToken, refreshToken, refreshTokenExpired } =
        await this.createTokenAndRefreshToken({
          entityManager,
          payload: userData,
          userId: userInsert.id,
        });

      const userToken = await entityManager.getRepository(Token).findOne({
        where: { userId: userInsert.id },
      });

      const upsertTokenData = {
        userId: userInsert.id,
        accessToken,
        refreshToken,
        refreshTokenExpired,
      };

      await entityManager
        .getRepository(Token)
        .save(
          Token.merge(userToken ? userToken : Token.create(), upsertTokenData),
        );
      const registerResponse: RegisterResponse = {
        user: userData,
        accessToken,
        refreshToken,
      };
      return registerResponse;
    });
  }

  async login(payload: LoginDto): Promise<LoginResponse> {
    try {
      return await getManager().transaction(async (entityManager) => {
        payload.email = payload.email.toLowerCase();
        const { email, password } = payload;

        const user = await createQueryBuilder(User, 'User')
          .innerJoinAndSelect('User.userRole', 'userRole')
          .where('email = :email', { email })
          .getOne();

        const roleId = user.userRole[0].roleId;
        if (!user) {
          throw new HttpException('Login failed', 400);
        }
        const isPasswordCorrect = await passwordUtil.isPasswordCorrect(password, user.password)

        if (!isPasswordCorrect) {
          throw new HttpException('wrong password, please try again', 400);
        }
        const scopeUser = await getManager()
          .getRepository(Role)
          .findOne({ id: roleId });
        const userData = {
          ..._.pick(user, userPickFields),
          scope: scopeUser.name,
        };
        const { accessToken, refreshToken, refreshTokenExpired } =
          await this.createTokenAndRefreshToken({
            payload: userData,
            userId: user.id,
          });
        const upsertUserTokenData = {
          userId: user.id,
          accessToken,
          refreshToken,
          refreshTokenExpired,
        };
        const userToken = await entityManager.getRepository(Token).findOne({
          where: { userId: user.id },
        });
        await entityManager
          .getRepository(Token)
          .save(
            Token.merge(
              userToken ? userToken : Token.create(),
              upsertUserTokenData,
            ),
          );
        const loginResponse: LoginResponse = {
          user: userData,
          accessToken,
          refreshToken,
        };
        return loginResponse;
      });
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(payload: RefreshTokenDto): Promise<RefreshTokenResponse> {
    try {
      const userToken = await getManager()
        .createQueryBuilder(Token, 'token')
        .where('"refreshToken" = :refreshToken', {
          refreshToken: payload.refreshToken,
        })
        .andWhere('"refreshTokenExpired" >= :refreshTokenExpired', {
          refreshTokenExpired: new Date().toISOString(),
        })
        .getOne();
      if (!userToken) {
        throw new HttpException('Refresh Token expired', 401);
      }
      const user = await getManager()
        .createQueryBuilder(User, 'User')
        .innerJoinAndSelect('User.userRole', 'userRole')
        .where('User.id = :id', { id: userToken.userId })
        .getOne();

      const roleId = user.userRole[0].roleId;
      const scopeUser = await getManager()
        .getRepository(Role)
        .findOne({ id: roleId });

      const jwtData = {
        ..._.pick(user, userPickFields),
        scope: scopeUser.name,
      };
      const { accessToken, refreshToken } =
        await this.createTokenAndRefreshToken({
          payload: jwtData,
          userId: user.id,
        });
      const refreshTokenResponse: RefreshTokenResponse = {
        accessToken,
        refreshToken,
      };
      return refreshTokenResponse;
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(payload: ResetPasswordDto): Promise<ResetPasswordResponse> {
    try {
      const { resetPasswordToken, newPassword } = payload;
      const token = await getManager()
        .createQueryBuilder(Token, 'token')
        .where('"resetToken" = :resetToken', {
          resetToken: resetPasswordToken,
        })
        .andWhere('"resetTokenExpired" >= :resetPasswordTokenExpired', {
          resetPasswordTokenExpired: new Date().toISOString(),
        })
        .getOne();
      if (!token) {
        throw new HttpException('Token expired, please try again', 401);
      }

      const user = await getManager()
        .createQueryBuilder(User, 'User')
        .where('User.id = :id', { id: token.userId })
        .getOne();

      const passwordHash =await passwordUtil.generateHash(newPassword);

      const isDuplicatedPassword = await bcrypt.compareSync(
        user.password,
        newPassword,
      );
      if (isDuplicatedPassword) {
        throw new HttpException(
          'Maybe same old password, please try again',
          400,
        );
      }

      await getManager()
        .createQueryBuilder(User, 'user')
        .update()
        .set({
          password: passwordHash,
        })
        .where('id = :id', { id: user.id })
        .execute();

      await getManager()
        .createQueryBuilder(Token, 'token')
        .update()
        .set({
          resetToken: null,
          resetTokenExpired: null,
        })
        .where('userId = :id', { id: user.id })
        .execute();
        const message = 'Your password has been changed'
      const resetPasswordResponse: ResetPasswordResponse = {
        message
      }
      return resetPasswordResponse;
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(payload: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    try {
      const { email } = payload;
      const user = await getManager()
        .createQueryBuilder(User, 'User')
        .where('email = :email', { email: email })
        .getOne();
      if (!user) {
        throw new HttpException('Email not found', 400);
      }
      const resetToken = nanoid(12);
      const resetTokenExpired = setTimeResetTokenExpired();

      await getManager()
        .createQueryBuilder(Token, 'token')
        .update()
        .set({
          resetToken,
          resetTokenExpired,
        })
        .where('userId = :id', { id: user.id })
        .execute();
      const linkResetPassword = 'linkResetPassword.com';
      this.sendEmailResetPassword(user.email, linkResetPassword);
      const message = 'Your reset password request has been confirmed'
      const forgotPasswordResponse: ForgotPasswordResponse = {
        message
      } 
      return forgotPasswordResponse
      ;
    } catch (error) {
      throw error;
    }
  }

  async sendEmailResetPassword(
    email: string,
    linkResetPassword: string,
  ): Promise<any> {
    // do nothing
  }
}
