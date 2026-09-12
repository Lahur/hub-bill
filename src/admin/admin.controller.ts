import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import { TenantAdminService } from '../tenants/tenant-admin.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

const FORM_PATH = path.join(__dirname, 'templates', 'new-tenant-form.html');
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB, generous for a template/logo/signature file

type UploadedFileMap = {
  outgoingBillHtml?: Express.Multer.File[];
  outgoingBillInfoHtml?: Express.Multer.File[];
  ingoingBillHtml?: Express.Multer.File[];
  logo?: Express.Multer.File[];
  signature?: Express.Multer.File[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

@Controller('admin/tenants')
export class AdminController {
  constructor(private readonly tenantAdminService: TenantAdminService) {}

  @Get('new')
  getForm(@Res() res: express.Response) {
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(fs.readFileSync(FORM_PATH, 'utf-8'));
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'outgoingBillHtml', maxCount: 1 },
        { name: 'outgoingBillInfoHtml', maxCount: 1 },
        { name: 'ingoingBillHtml', maxCount: 1 },
        { name: 'logo', maxCount: 1 },
        { name: 'signature', maxCount: 1 },
      ],
      { limits: { fileSize: MAX_UPLOAD_SIZE } },
    ),
  )
  async create(
    @Body() body: CreateTenantDto,
    @UploadedFiles() files: UploadedFileMap,
    @Res() res: express.Response,
  ) {
    const outgoingBillHtml = files.outgoingBillHtml?.[0];
    const outgoingBillInfoHtml = files.outgoingBillInfoHtml?.[0];
    const ingoingBillHtml = files.ingoingBillHtml?.[0];
    const logo = files.logo?.[0];
    const signature = files.signature?.[0];

    const missing = [
      !body.code && 'code',
      !body.name && 'name',
      !outgoingBillHtml && 'OUTGOING_BILL html file',
      !outgoingBillInfoHtml && 'OUTGOING_BILL_INFO html file',
      !ingoingBillHtml && 'INGOING_BILL html file',
      !logo && 'logo',
      !signature && 'signature',
    ].filter(Boolean);

    if (missing.length > 0) {
      res.status(400).set('Content-Type', 'text/html; charset=utf-8');
      return res.send(
        `<div class="result error">Missing required field(s): ${escapeHtml(missing.join(', '))}</div>`,
      );
    }

    try {
      await this.tenantAdminService.createTenant({
        code: body.code,
        name: body.name,
        outgoingBillHtml: outgoingBillHtml!.buffer.toString('utf-8'),
        outgoingBillInfoHtml: outgoingBillInfoHtml!.buffer.toString('utf-8'),
        ingoingBillHtml: ingoingBillHtml!.buffer.toString('utf-8'),
        logo: { buffer: logo!.buffer, mimetype: logo!.mimetype },
        signature: {
          buffer: signature!.buffer,
          mimetype: signature!.mimetype,
        },
      });
    } catch (err) {
      res.status(err.status ?? 500);
      res.set('Content-Type', 'text/html; charset=utf-8');
      return res.send(
        `<div class="result error">${escapeHtml(err.message ?? 'Failed to create tenant')}</div>`,
      );
    }

    res.status(201).set('Content-Type', 'text/html; charset=utf-8');
    res.send(
      `<div class="result success">Tenant '${escapeHtml(body.code)}' created.</div>`,
    );
  }
}
