import { IsOptional, IsString } from 'class-validator';

export class CreateOrganisationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
