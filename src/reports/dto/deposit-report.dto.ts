export class DepositReportDto {
  creditAccount: string;
  depositNumber: string;
  amount: string;
  amountInWords: string;
  amountReceived?: string;
  purpose: string;
  place: string;
  day: string;
  year: string;
  /** Name, or a signature image as a data URI / URL (e.g. "data:image/png;base64,..."). Falls back to the default signature image when omitted. */
  liquidator?: string;
  /** Name, or a signature image as a data URI / URL (e.g. "data:image/png;base64,..."). Falls back to the default signature image when omitted. */
  cashier?: string;
  /** Name, or a signature image as a data URI / URL (e.g. "data:image/png;base64,..."). Falls back to the default signature-with-stamp image when omitted. */
  payerSignature?: string;
}
