import { ConflictException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantTemplate } from './entities/tenant-template.entity';
import { TenantAsset } from './entities/tenant-asset.entity';
import { TemplateCode } from './template-code';

interface UploadedAsset {
  buffer: Buffer;
  mimetype: string;
}

export interface CreateTenantInput {
  code: string;
  name: string;
  outgoingBillHtml: string;
  outgoingBillInfoHtml: string;
  ingoingBillHtml: string;
  logo: UploadedAsset;
  signature: UploadedAsset;
  signatureWithStamp: UploadedAsset;
}

// Postgres unique_violation - see https://www.postgresql.org/docs/current/errcodes-appendix.html
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class TenantAdminService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async createTenant(input: CreateTenantInput): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const tenant = await manager.save(Tenant, {
          code: input.code,
          name: input.name,
        });

        const templates: [TemplateCode, string][] = [
          [TemplateCode.OUTGOING_BILL, input.outgoingBillHtml],
          [TemplateCode.OUTGOING_BILL_INFO, input.outgoingBillInfoHtml],
          [TemplateCode.INGOING_BILL, input.ingoingBillHtml],
        ];
        for (const [templateKey, html] of templates) {
          await manager.save(TenantTemplate, { tenant, templateKey, html });
        }

        await manager.save(TenantAsset, {
          tenant,
          assetKey: 'logo',
          content: input.logo.buffer,
          contentType: input.logo.mimetype,
        });
        await manager.save(TenantAsset, {
          tenant,
          assetKey: 'default-signature',
          content: input.signature.buffer,
          contentType: input.signature.mimetype,
        });
        await manager.save(TenantAsset, {
          tenant,
          assetKey: 'default-signature-with-stamp',
          content: input.signatureWithStamp.buffer,
          contentType: input.signatureWithStamp.mimetype,
        });
      });
    } catch (err) {
      if (err.code === UNIQUE_VIOLATION) {
        throw new ConflictException(`Tenant '${input.code}' already exists`);
      }
      throw err;
    }
  }
}
