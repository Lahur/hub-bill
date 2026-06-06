export class IncomingInvoiceSupplierDto {
  name: string;
  street: string;
  postalZone: string;
  city: string;
  oib: string;
  contactName: string;
  email: string;
}

export class IncomingInvoiceCustomerDto {
  name: string;
  street: string;
  postalZone: string;
  city: string;
  oib: string;
  contactName?: string;
  contactEmail?: string;
}

export class IncomingInvoiceLineDto {
  id: string;
  name: string;
  description?: string;
  classificationCode: string;
  quantity: number;
  unitCode: string;
  unitPrice: string;
  vatCategory: string;
  lineExtensionAmount: string;
}

export class IncomingInvoiceTaxSubtotalDto {
  categoryId: string;
  percent: number;
  taxableAmount: string;
  taxAmount: string;
  taxExemptionReason?: string;
}

export class IncomingInvoiceTaxTotalDto {
  taxAmount: string;
  subtotals: IncomingInvoiceTaxSubtotalDto[];
}

export class IncomingInvoiceMonetaryTotalDto {
  lineExtensionAmount: string;
  taxExclusiveAmount: string;
  prepaidAmount?: string;
  payableAmount: string;
}

export class IncomingInvoicePaymentMeansDto {
  iban: string;
  paymentId: string;
  instructionId: string;
  instructionNote: string;
  paymentDueDate: string;
  accountCurrencyCode: string;
}

export class IncomingInvoiceReportDto {
  invoiceId: string;
  issueDate: string;
  issueTime: string;
  dueDate: string;
  deliveryDate?: string;
  currencyCode: string;
  invoiceTypeCode: string;
  copyIndicator?: boolean;
  supplier: IncomingInvoiceSupplierDto;
  customer: IncomingInvoiceCustomerDto;
  lines: IncomingInvoiceLineDto[];
  taxTotal: IncomingInvoiceTaxTotalDto;
  monetaryTotal: IncomingInvoiceMonetaryTotalDto;
  paymentMeans: IncomingInvoicePaymentMeansDto;
  notes?: string[];
}
