import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantTemplate } from './entities/tenant-template.entity';
import { TenantAsset } from './entities/tenant-asset.entity';

@Injectable()
export class TenantTemplatesService {
  private readonly templateCache = new Map<string, string>();
  private readonly assetCache = new Map<string, string>();

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(TenantTemplate)
    private readonly templateRepo: Repository<TenantTemplate>,
    @InjectRepository(TenantAsset)
    private readonly assetRepo: Repository<TenantAsset>,
  ) {}

  async getTemplateHtml(
    tenantCode: string,
    templateKey: string,
  ): Promise<string> {
    const cacheKey = `${tenantCode}:${templateKey}`;
    const cached = this.templateCache.get(cacheKey);
    if (cached) return cached;

    const tenant = await this.resolveTenant(tenantCode);
    const row = await this.templateRepo.findOne({
      where: { tenant: { id: tenant.id }, templateKey },
    });
    if (!row) {
      throw new NotFoundException(
        `Tenant '${tenantCode}' has no template '${templateKey}'`,
      );
    }

    this.templateCache.set(cacheKey, row.html);
    return row.html;
  }

  async getAssetDataUri(tenantCode: string, assetKey: string): Promise<string> {
    const cacheKey = `${tenantCode}:${assetKey}`;
    const cached = this.assetCache.get(cacheKey);
    if (cached) return cached;

    const tenant = await this.resolveTenant(tenantCode);
    const row = await this.assetRepo.findOne({
      where: { tenant: { id: tenant.id }, assetKey },
    });
    if (!row) {
      throw new NotFoundException(
        `Tenant '${tenantCode}' has no asset '${assetKey}'`,
      );
    }

    const dataUri = `data:${row.contentType};base64,${row.content.toString('base64')}`;
    this.assetCache.set(cacheKey, dataUri);
    return dataUri;
  }

  private async resolveTenant(tenantCode: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({
      where: { code: tenantCode },
    });
    if (!tenant) {
      throw new NotFoundException(`Unknown tenant '${tenantCode}'`);
    }
    return tenant;
  }
}
