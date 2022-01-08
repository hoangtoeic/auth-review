import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createRoleDto,
  ForgotPasswordDto,
  loginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  resetPasswordDto,
  updateUserDto,
} from './dto';
import {
  createQueryBuilder,
  getConnection,
  getManager,
  getRepository,
} from 'typeorm';
import { User } from 'src/db/entities/user.entity';
import { ConnectionDB } from 'src/connectionDB/connectionDB';
import {
  ConnectionManager,
  Repository,
  Connection,
  EntityManager,
} from 'typeorm';
import {
  InjectRepository,
  InjectConnection,
  InjectEntityManager,
} from '@nestjs/typeorm';
import { use } from 'passport';
import { targetModulesByContainer } from '@nestjs/core/router/router-module';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { suid } from 'rand-token';
import { saltRoundConstants } from './constant/saltRound';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import { Token } from 'src/db/entities/token.entity';
import { ROLE, Role } from 'src/db/entities/role.entity';
import { UserRole } from 'src/db/entities/user-role.entity';

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

    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const day = new Date().getDate();
    const setTimeRefreshTokenExpired = new Date(year + 1, month, day);

    const refreshTokenExpired = getOldRefreshToken
      ? getOldRefreshToken.refreshTokenExpired
      : setTimeRefreshTokenExpired.toISOString();
    return {
      accessToken,
      refreshToken,
      refreshTokenExpired,
    };
  }

  async register(payload: RegisterDto) {
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
      const passwordHash = await bcrypt.hash(
        password,
        saltRoundConstants.saltRounds,
      );
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
      const jwtData = {
        ..._.pick(userInsert, userPickFields),
        scope: role.name,
      };

      const { accessToken, refreshToken, refreshTokenExpired } =
        await this.createTokenAndRefreshToken({
          entityManager,
          payload: jwtData,
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
      return {
        user: jwtData,
        accessToken,
        refreshToken,
      };
    });
  }

  async login(payload: loginDto): Promise<any> {
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
       
        const passwordHash = await bcrypt.hash(
          password,
          saltRoundConstants.saltRounds,
        );
        
        const isPasswordCorrect = await bcrypt.compare(user.password,passwordHash)
        
        if (!isPasswordCorrect) {
          throw new HttpException('wrong password, please try again', 400);
        }
        const scopeUser = await getManager()
          .getRepository(Role)
          .findOne({ id: roleId });
        const jwtData = {
          ..._.pick(user, userPickFields),
          scope: scopeUser.name,
        };
        const { accessToken, refreshToken, refreshTokenExpired } =
          await this.createTokenAndRefreshToken({
            payload: jwtData,
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
        return {
          user: jwtData,
          accessToken,
          refreshToken,
        };
      });
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(payload: RefreshTokenDto): Promise<any> {
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
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(payload: ResetPasswordDto): Promise<any> {
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

      const passwordHash = await bcrypt.hash(
        newPassword,
        saltRoundConstants.saltRounds,
      );

      const isDuplicatedPassword = await bcrypt.compare(
        user.password,
        passwordHash,
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

      return { message: 'Your password has been changed' };
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(payload: ForgotPasswordDto): Promise<any> {
  try {
    const { email } = payload
    const user = await getManager()
    .createQueryBuilder(User, 'User')
    .where('email = :email', { email: email })
    .getOne();
    if (!user) {
      throw new HttpException("Email not found",400)
    }
      const resetToken = nanoid(12);
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      const day = new Date().getDate();
      const setTimeResetTokenExpired = new Date(year, month, day + 1);    
      const resetTokenExpired = setTimeResetTokenExpired.toISOString()

      await getManager()
          .createQueryBuilder(Token, 'token')
          .update()
          .set({
            resetToken,
            resetTokenExpired
          })
          .where('userId = :id', { id: user.id })
          .execute();
          const linkResetPassword = "linkResetPassword.com"
          this.sendEmailResetPassword(
            user.email,
            linkResetPassword
          );
          return { message: 'Your reset password request has been confirmed' };
        }
       
        catch (error) {
          throw error
    } 
  }
  

  async sendEmailResetPassword(email: string,linkResetPassword: string): Promise<any> {
    // do mothing
  }
}


