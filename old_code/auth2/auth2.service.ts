import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup2.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
//import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService2 {
  constructor(
    //private jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async signup(signupData: Prisma.usersCreateInput) {
    const { email, password } = signupData;

    //Check if email is in use
    const emailInUse = await this.prisma.users.findUnique({
      where: {
        email,
      }
    });

    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }
    //Hash password (TODO: change to bcrypt)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document and save in DB
    await this.prisma.users.create({
      data: signupData
    });
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    //Find if user exists by email
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Compare entered password with existing password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Generate JWT tokens
    // const tokens = await this.generateUserTokens(user.user_id);
    // return {
    //   ...tokens,
    //   userId: user.user_id,
    // };
  }

  async changePassword(userId, oldPassword: string, newPassword: string) {
    //Find the user
    const userData = await this.prisma.users.findUnique({ where: { user_id: userId } });
    if (!userData) {
      throw new NotFoundException('User not found...');
    }

    //Compare the old password with the password in DB
    const passwordMatch = await bcrypt.compare(oldPassword, userData.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Change user's password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    userData.password = newHashedPassword;
    await this.prisma.users.update({
      where: { user_id: userId },
      data: {password: userData.password}
    });
  }

  async forgotPassword(email: string) {
    //Check that user exists
    const user = await this.prisma.users.findUnique({ where: { email } });

    // if (user) {
    //   //If user exists, generate password reset link
    //   const expiryDate = new Date();
    //   expiryDate.setHours(expiryDate.getHours() + 1);

    //   const resetToken = randomInt(64);
    //   await this.ResetTokenModel.create({
    //     token: resetToken,
    //     userId: user._id,
    //     expiryDate,
    //   });
    //   //Send the link to the user by email
    //   this.mailService.sendPasswordResetEmail(email, resetToken);
    // }

    return { message: 'If this user exists, they will receive an email' };
  }

  async resetPassword(newPassword: string, resetToken: string) {
    // //Find a valid reset token document
    // const token = await this.ResetTokenModel.findOneAndDelete({
    //   token: resetToken,
    //   expiryDate: { $gte: new Date() },
    // });

    // if (!token) {
    //   throw new UnauthorizedException('Invalid link');
    // }

    // //Change user password (MAKE SURE TO HASH!!)
    // const user = await this.UserModel.findById(token.userId);
    // if (!user) {
    //   throw new InternalServerErrorException();
    // }

    // user.password = await bcrypt.hash(newPassword, 10);
    // await user.save();
  }

  async refreshTokens(refreshToken: string) {
    // const token = await this.RefreshTokenModel.findOne({
    //   token: refreshToken,
    //   expiryDate: { $gte: new Date() },
    // });

    // if (!token) {
    //   throw new UnauthorizedException('Refresh Token is invalid');
    // }
    // return this.generateUserTokens(token.userId);
  }

  // async generateUserTokens(userId) {
  //   const accessToken = this.jwtService.sign({ userId }, { expiresIn: '10h' });
  //   const refreshToken = uuidv4();

  //   await this.storeRefreshToken(refreshToken, userId);
  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    // await this.RefreshTokenModel.updateOne(
    //   { userId },
    //   { $set: { expiryDate, token } },
    //   {
    //     upsert: true,
    //   },
    // );
  }
}