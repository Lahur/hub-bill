import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { randomUUID } from 'crypto';
import * as Handlebars from 'handlebars';
import puppeteer, { Browser } from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { BillReportDto } from './dto/bill-report.dto';
import { BillWithDetailsReportDto } from './dto/bill-with-details-report.dto';
import { InvoiceDetailsReportDto } from './dto/invoice-details-report.dto';
import { IncomingInvoiceReportDto } from './dto/incoming-invoice-report.dto';
import { PosTransactionReportDto } from './dto/pos-transaction-report.dto';

const TEMPLATES_DIR = path.join(__dirname, 'templates');

@Injectable()
export class ReportsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReportsService.name);
  private browser: Browser;

  async onModuleInit() {
    this.browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-crash-reporter'],
    });
  }

  async onModuleDestroy() {
    await this.browser.close();
  }

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

    const tmpFile = path.join(os.tmpdir(), `report-${randomUUID()}.html`);
    fs.writeFileSync(tmpFile, html);

    const start = Date.now();
    const page = await this.browser.newPage();
    try {
      await page.goto(`file://${tmpFile}`, { waitUntil: 'load' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      this.logger.log(
        `Rendered ${templateFile} in ${Date.now() - start}ms`,
      );
      return Buffer.from(pdf);
    } catch (err) {
      this.logger.error(`Failed to render ${templateFile}`, err.stack);
      throw err;
    } finally {
      await page.close();
      fs.unlinkSync(tmpFile);
    }
  }

  async createBill(dto: BillReportDto): Promise<Buffer> {
    this.logger.log(`Creating bill ${dto.billNumber}`);
    return this.renderTemplate('template.html', dto);
  }

  async createDetailedBill(dto: BillWithDetailsReportDto): Promise<Buffer> {
    this.logger.log(`Creating detailed bill ${dto.billNumber}`);
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

    this.logger.log(`Merged detailed bill ${dto.billNumber}`);
    return Buffer.from(await merged.save());
  }

  async createIngoingBill(dto: IncomingInvoiceReportDto): Promise<Buffer> {
    this.logger.log(`Creating incoming invoice ${dto.invoiceId}`);
    return this.renderTemplate('template_outgoing.html', dto);
  }

  async createPosTransaction(dto: PosTransactionReportDto): Promise<Buffer> {
    this.logger.log(`Creating POS transaction report ${dto.transactionId}`);
    return this.renderTemplate('template_pos_transaction.html', dto);
  }
}
