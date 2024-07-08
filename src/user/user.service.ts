import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { OrganisationService } from 'src/organisation/organisation.service';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => OrganisationService))
    private readonly organisationService: OrganisationService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    // create a user
    const newUser = this.usersRepository.create({
      ...rest,
      email,
      password: hashedPassword,
    });

    const newOrganisation = await this.organisationService.create({
      name: `${newUser.firstName}'s Organisation`,
      users: [newUser], // Link the new user to the organization
    });

    newUser.organisations = [newOrganisation];

    const user = await this.usersRepository.save(newUser);

    return { user, organisation: newOrganisation };
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .addSelect('user.password')
        .getOne();

      if (!user) {
        throw new Error();
      }

      const isValid = bcrypt.compareSync(password, user.password);

      if (!isValid) {
        throw new Error();
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async getByUserId(userId: string) {
    const user = await this.usersRepository.findOne({ where: { userId } });

    if (!user) {
      throw new NotFoundException(`User with ID: ${userId} not found`);
    }

    return user;
  }

  async getMyUser(id: string, user: User) {
    if (id !== user.userId) {
      throw new UnauthorizedException(
        'You are not authorized to view this user',
      );
    }

    return user;
  }
}
