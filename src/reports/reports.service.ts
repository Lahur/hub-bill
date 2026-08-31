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
import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { BillReportDto } from './dto/bill-report.dto';
import { BillWithDetailsReportDto } from './dto/bill-with-details-report.dto';
import { InvoiceDetailsReportDto } from './dto/invoice-details-report.dto';
import { IncomingInvoiceReportDto } from './dto/incoming-invoice-report.dto';
import { PosTransactionReportDto } from './dto/pos-transaction-report.dto';
import { DisbursementReportDto } from './dto/disbursement-report.dto';
import { DepositReportDto } from './dto/deposit-report.dto';
import { BankStatementReportDto } from './dto/bank-statement-report.dto';

const TEMPLATES_DIR = path.join(__dirname, 'templates');

Handlebars.registerHelper('isImageSrc', (value: unknown) => {
  if (typeof value !== 'string') return false;
  return (
    /^data:image\//.test(value) ||
    /^https?:\/\//.test(value) ||
    /\.(png|jpe?g|gif|svg|webp)$/i.test(value)
  );
});

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
    pdfOptions: PDFOptions = { format: 'A4' },
    postProcess?: (page: Page) => Promise<void>,
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
      if (postProcess) {
        await postProcess(page);
      }
      const pdf = await page.pdf({ printBackground: true, ...pdfOptions });
      this.logger.log(`Rendered ${templateFile} in ${Date.now() - start}ms`);
      return Buffer.from(pdf);
    } catch (err) {
      this.logger.error(`Failed to render ${templateFile}`, err.stack);
      throw err;
    } finally {
      await page.close();
      fs.unlinkSync(tmpFile);
    }
  }

  /**
   * Wraps `text` across the two given element ids, measuring against each
   * element's actual rendered width/font so long amounts-in-words don't
   * overflow the disbursement/deposit slip line ruling.
   */
  private async fillWrappedText(
    page: Page,
    lineIds: [string, string],
    text: string | undefined,
  ): Promise<void> {
    if (!text) return;
    await page.evaluate(
      (ids: [string, string], value: string) => {
        const [id1, id2] = ids;
        const el1 = document.getElementById(id1);
        const el2 = document.getElementById(id2);
        if (!el1 || !el2) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const style = getComputedStyle(el1);
        ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

        const fits = (str: string, maxWidth: number) =>
          ctx.measureText(str).width <= maxWidth;

        const words = value.split(' ');
        let line1 = '';
        let i = 0;
        for (; i < words.length; i++) {
          const candidate = line1 ? `${line1} ${words[i]}` : words[i];
          if (line1 && !fits(candidate, el1.clientWidth)) break;
          line1 = candidate;
        }

        let line2 = words.slice(i).join(' ');
        while (line2 && !fits(line2, el2.clientWidth)) {
          line2 = line2.slice(0, -1);
        }

        el1.textContent = line1;
        el2.textContent = line2;
      },
      lineIds,
      text,
    );
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

  async createDisbursement(dto: DisbursementReportDto): Promise<Buffer> {
    this.logger.log(`Creating disbursement ${dto.disbursementNumber}`);
    return this.renderTemplate(
      'template_isplatnica.html',
      dto,
      undefined,
      (page) =>
        Promise.all([
          this.fillWrappedText(
            page,
            ['amount-words-line1', 'amount-words-line2'],
            dto.amountInWords,
          ),
          this.fillWrappedText(
            page,
            ['recipient-name-line1', 'recipient-name-line2'],
            dto.recipientName,
          ),
          this.fillWrappedText(
            page,
            ['purpose-line1', 'purpose-line2'],
            dto.purpose,
          ),
        ]).then(() => undefined),
    );
  }

  async createBankStatement(dto: BankStatementReportDto): Promise<Buffer> {
    this.logger.log(`Creating bank statement report ${dto.statementNumber}`);
    return this.renderTemplate('template_bank_statement.html', {
      ...dto,
      transactions: dto.transactions ?? [],
    });
  }

  async createDeposit(dto: DepositReportDto): Promise<Buffer> {
    this.logger.log(`Creating deposit ${dto.depositNumber}`);
    return this.renderTemplate(
      'template_uplatnica.html',
      dto,
      undefined,
      (page) =>
        Promise.all([
          this.fillWrappedText(
            page,
            ['amount-words-line1', 'amount-words-line2'],
            dto.amountInWords,
          ),
          this.fillWrappedText(
            page,
            ['amount-received-line1', 'amount-received-line2'],
            dto.amountReceived,
          ),
          this.fillWrappedText(
            page,
            ['purpose-line1', 'purpose-line2'],
            dto.purpose,
          ),
        ]).then(() => undefined),
    );
  }
}
