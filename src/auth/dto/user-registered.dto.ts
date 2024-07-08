import { ApiHideProperty, OmitType } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export class UserWithoutOrganisation extends OmitType(User, [
  'organisations',
  'password',
] as const) {}

export class UserWithAccessToken {
  user: UserWithoutOrganisation;
  accessToken: string;

  @ApiHideProperty()
  message: string;
}
