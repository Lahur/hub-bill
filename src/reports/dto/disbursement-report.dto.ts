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
  /** Name, or a signature image as a data URI / URL. Falls back to the default signature-with-stamp image when omitted. */
  cashier?: string;
  recipientSignature?: string;
}
