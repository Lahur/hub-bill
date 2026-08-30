export class DisbursementReportDto {
  chargedAccount: string;
  disbursementNumber: string;
  amount: string;
  amountInWords: string;
  recipientName: string;
  purpose: string;
  place: string;
  day: string;
  year: string;
  liquidator?: string;
  cashier?: string;
  recipientSignature?: string;
}
