import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddUserToOrganisationDto } from 'src/organisation/dto/add-user-to-organisation.dto';
import { CreateOrganisationDto } from 'src/organisation/dto/create-organisation.dto';
import {
  GetOrganisationsDto,
  OrganisationWithoutUsersDto,
} from 'src/organisation/dto/organisation-without-users.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Organisation } from './entities/organisation.entity';

@Injectable()
export class OrganisationService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationsRepository: Repository<Organisation>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async create(createOrganisationDto: Omit<Organisation, 'orgId'>) {
    const organisation = this.organisationsRepository.create(
      createOrganisationDto,
    );

    return this.organisationsRepository.save(organisation);
  }

  async getUserOrganisations(user: User): Promise<GetOrganisationsDto> {
    return this.organisationsRepository
      .find({
        where: { users: user },
      })
      .then((organisations) => {
        return { organisations };
      });
  }

  async getUserOrganisationByOrgId(
    orgId: string,
    user: User,
  ): Promise<OrganisationWithoutUsersDto> {
    const organisation = await this.organisationsRepository.findOne({
      where: { orgId, users: user },
    });

    if (!organisation) {
      throw new NotFoundException(`Organisation with ID: ${orgId} not found`);
    }

    return organisation;
  }

  async createOrganisation(
    createOrganisationDto: CreateOrganisationDto,
    user: User,
  ): Promise<OrganisationWithoutUsersDto> {
    try {
      const newOrganisation = await this.create({
        ...createOrganisationDto,
        users: [user],
      });

      delete newOrganisation.users;

      return newOrganisation;
    } catch (error) {
      throw new BadRequestException('Client error');
    }
  }

  async addUserToOrganisation(
    orgId: string,
    addUserToOrganisationDto: AddUserToOrganisationDto,
    user: User,
  ) {
    const organisation = await this.organisationsRepository.findOne({
      where: { orgId, users: user },
      relations: ['users'],
    });

    if (!organisation) {
      throw new NotFoundException(`Organisation with ID: ${orgId} not found`);
    }

    const userToAdd = await this.userService.getByUserId(
      addUserToOrganisationDto.userId,
    );

    organisation.users.push(userToAdd);

    await this.organisationsRepository.save(organisation);

    return 'User added to organisation successfully';
  }
}
