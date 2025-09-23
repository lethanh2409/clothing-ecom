import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';
import { Expose } from 'class-transformer';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  role_id: number;

  @Column({ type: 'varchar', nullable: false, default: 'UNKNOWN' })
  @Expose()
  role_name: string; // e.g. 'CUSTOMER', 'ADMIN';

  @Column({ nullable: true })
  description: string;

  @Column({ default: 1 })
  status: number;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
