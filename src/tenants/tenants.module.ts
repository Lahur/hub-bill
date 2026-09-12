import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantTemplate } from './entities/tenant-template.entity';
import { TenantAsset } from './entities/tenant-asset.entity';
import { TenantTemplatesService } from './tenant-templates.service';
import { TenantAdminService } from './tenant-admin.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantTemplate, TenantAsset])],
  providers: [TenantTemplatesService, TenantAdminService],
  exports: [TenantTemplatesService, TenantAdminService],
})
export class TenantsModule {}
