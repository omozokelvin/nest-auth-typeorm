import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Organisation {
  @PrimaryGeneratedColumn('uuid')
  orgId: string;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.organisations)
  users: User[];

  @Column({
    nullable: true,
  })
  description?: string;
}
