import { Controller, Post, Body, Res } from '@nestjs/common';
import express from 'express';
import { ReportsService } from './reports.service';
import { BillReportDto } from './dto/bill-report.dto';
import { BillWithDetailsReportDto } from './dto/bill-with-details-report.dto';
import { IncomingInvoiceReportDto } from './dto/incoming-invoice-report.dto';
import { PosTransactionReportDto } from './dto/pos-transaction-report.dto';
import { DisbursementReportDto } from './dto/disbursement-report.dto';
import { DepositReportDto } from './dto/deposit-report.dto';
import { BankStatementReportDto } from './dto/bank-statement-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('bill')
  async generateBill(@Body() dto: BillReportDto, @Res() res: express.Response) {
    const pdf = await this.reportsService.createBill(dto);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="bill.pdf"',
    });
    res.send(pdf);
  }

  @Post('bill-with-details')
  async generateBillWithDetails(
    @Body() dto: BillWithDetailsReportDto,
    @Res() res: express.Response,
  ) {
    const pdf = await this.reportsService.createDetailedBill(dto);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="bill-with-details.pdf"',
    });
    res.send(pdf);
  }

  @Post('incoming-invoice')
  async generateIncomingInvoice(
    @Body() dto: IncomingInvoiceReportDto,
    @Res() res: express.Response,
  ) {
    const pdf = await this.reportsService.createIngoingBill(dto);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="incoming-invoice.pdf"',
    });
    res.send(pdf);
  }

  @Post('pos-transaction')
  async generatePosTransaction(
    @Body() dto: PosTransactionReportDto,
    @Res() res: express.Response,
  ) {
    const pdf = await this.reportsService.createPosTransaction(dto);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="pos-transaction.pdf"',
    });
    res.send(pdf);
  }

  @Post('disbursement')
  async generateDisbursement(
    @Body() dto: DisbursementReportDto,
    @Res() res: express.Response,
  ) {
    const pdf = await this.reportsService.createDisbursement(dto);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="disbursement.pdf"',
    });
    res.send(pdf);
  }

  @Post('bank-statement')
  async generateBankStatement(
    @Body() dto: BankStatementReportDto,
    @Res() res: express.Response,
  ) {
    const pdf = await this.reportsService.createBankStatement(dto);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="bank-statement.pdf"',
    });
    res.send(pdf);
  }

  @Post('deposit')
  async generateDeposit(
    @Body() dto: DepositReportDto,
    @Res() res: express.Response,
  ) {
    const pdf = await this.reportsService.createDeposit(dto);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="deposit.pdf"',
    });
    res.send(pdf);
  }
}
