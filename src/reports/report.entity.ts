import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @Column()
  model: string;

  @Column()
  make: string;

  @ManyToOne(() => User, (user) => user.reports)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
