import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/_common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AddUserToOrganisationDto } from 'src/organisation/dto/add-user-to-organisation.dto';
import { CreateOrganisationDto } from 'src/organisation/dto/create-organisation.dto';
import { OrganisationService } from 'src/organisation/organisation.service';
import { User } from 'src/user/entities/user.entity';

@Controller('api/organisations')
@ApiTags('Organisation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrganisationController {
  constructor(private readonly organisationService: OrganisationService) {}

  @Get()
  getMyOrganisations(@GetUser() user: User) {
    return this.organisationService.getUserOrganisations(user);
  }

  @Get(':orgId')
  getSingleOrganisation(@Param('orgId') orgId: string, @GetUser() user: User) {
    return this.organisationService.getUserOrganisationByOrgId(orgId, user);
  }

  @Post()
  createOrganisation(
    @Body() createOrganisationDto: CreateOrganisationDto,
    @GetUser() user: User,
  ) {
    return this.organisationService.createOrganisation(
      createOrganisationDto,
      user,
    );
  }

  @Post(':orgId/users')
  addUserToOrganisation(
    @Param('orgId') orgId: string,
    @Body() addUserToOrganisationDto: AddUserToOrganisationDto,
    @GetUser() user: User,
  ) {
    return this.organisationService.addUserToOrganisation(
      orgId,
      addUserToOrganisationDto,
      user,
    );
  }
}
