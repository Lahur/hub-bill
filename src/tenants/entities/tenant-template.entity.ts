import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_templates')
@Index(['tenant', 'templateKey'], { unique: true })
export class TenantTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'template_key' })
  templateKey: string;

  @Column('text')
  html: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
