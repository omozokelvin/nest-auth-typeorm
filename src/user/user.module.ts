import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganisationModule } from 'src/organisation/organisation.module';
import { User } from 'src/user/entities/user.entity';
import { UserController } from 'src/user/user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => OrganisationModule),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
