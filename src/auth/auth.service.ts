import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserWithAccessToken } from 'src/auth/dto/user-registered.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const { user } = await this.userService.create(createUserDto);

      return this.generateToken(user, 'Registration successful');
    } catch (error) {
      throw new BadRequestException('Registration unsuccessful');
    }
  }

  async login(user: User) {
    try {
      return this.generateToken(user, 'Login successful');
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async generateToken(
    user: User,
    message: string,
  ): Promise<UserWithAccessToken> {
    const payload = { sub: user.userId };
    const accessToken = await this.jwtService.signAsync(payload);

    user?.organisations?.length && delete user.organisations;
    user?.password && delete user.password;

    return { user, accessToken, message };
  }
}
