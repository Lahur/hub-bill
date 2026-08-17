export class PosTransactionReportDto {
  transactionId: string;
  bankTransactionId?: string;
  amount: string;
  currencyCode: string;
  senderIban: string;
  receiverIban: string;
  reference?: string;
  additionalRemittanceInfo?: string;
  transactionDate: string;
  transactionTime: string;
  hasBill: boolean;
}
