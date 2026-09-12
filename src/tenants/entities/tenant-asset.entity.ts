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

@Entity('tenant_assets')
@Index(['tenant', 'assetKey'], { unique: true })
export class TenantAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'asset_key' })
  assetKey: string;

  @Column('bytea')
  content: Buffer;

  @Column({ name: 'content_type' })
  contentType: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
