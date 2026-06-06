import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { BillReportDto } from './dto/bill-report.dto';
import { BillWithDetailsReportDto } from './dto/bill-with-details-report.dto';
import { InvoiceDetailsReportDto } from './dto/invoice-details-report.dto';
import { IncomingInvoiceReportDto } from './dto/incoming-invoice-report.dto';

const TEMPLATES_DIR = path.join(__dirname, 'templates');

@Injectable()
export class ReportsService {
  private async renderTemplate(
    templateFile: string,
    data: object,
  ): Promise<Buffer> {
    const source = fs.readFileSync(
      path.join(TEMPLATES_DIR, templateFile),
      'utf-8',
    );
    const html = Handlebars.compile(source)({
      ...data,
      templateDir: `file://${TEMPLATES_DIR}`,
    });

    const tmpFile = path.join(os.tmpdir(), `report-${Date.now()}.html`);
    fs.writeFileSync(tmpFile, html);

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.goto(`file://${tmpFile}`, { waitUntil: 'load' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
      fs.unlinkSync(tmpFile);
    }
  }

  async createBill(dto: BillReportDto): Promise<Buffer> {
    return this.renderTemplate('template.html', dto);
  }

  async createDetailedBill(dto: BillWithDetailsReportDto): Promise<Buffer> {
    const [billBuffer, detailsBuffer] = await Promise.all([
      this.renderTemplate('template.html', dto),
      this.renderTemplate('template_details.html', dto.details),
    ]);

    const merged = await PDFDocument.create();
    for (const buffer of [billBuffer, detailsBuffer]) {
      const doc = await PDFDocument.load(buffer);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
    }

    return Buffer.from(await merged.save());
  }

  async createIngoingBill(dto: IncomingInvoiceReportDto): Promise<Buffer> {
    return this.renderTemplate('template_outgoing.html', dto);
  }
}
