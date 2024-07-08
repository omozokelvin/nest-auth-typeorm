import { OmitType } from '@nestjs/swagger';
import { Organisation } from 'src/organisation/entities/organisation.entity';

export class OrganisationWithoutUsersDto extends OmitType(Organisation, [
  'users',
] as const) {}

export class GetOrganisationsDto {
  organisations: OrganisationWithoutUsersDto[];
}
