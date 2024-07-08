import { IsString, IsUUID } from 'class-validator';

export class AddUserToOrganisationDto {
  @IsString()
  @IsUUID()
  userId: string;
}
