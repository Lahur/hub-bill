export class BankStatementTransactionDto {
  rowNumber: number;
  bookingDate: string;
  valueDate?: string;
  entryReference?: string;
  transactionReference?: string;
  counterpartyIban?: string;
  counterpartyName?: string;
  counterpartyAddress?: string;
  payerReference?: string;
  payeeReference?: string;
  description?: string;
  debitAmount?: string;
  creditAmount?: string;
}

export class BankStatementReportDto {
  bankName?: string;
  bankAddress?: string;
  bankOib?: string;
  bankBic?: string;
  statementNumber: string;
  statementDate?: string;
  accountIban: string;
  accountName?: string;
  currency?: string;
  ownerName?: string;
  ownerAddress?: string;
  ownerOib?: string;
  periodFrom?: string;
  periodTo?: string;
  openingBalance?: string;
  closingBalance?: string;
  creditCount?: string;
  creditSum?: string;
  debitCount?: string;
  debitSum?: string;
  transactions: BankStatementTransactionDto[];
}
