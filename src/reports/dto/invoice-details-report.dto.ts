export class InvoiceDetailsSupplierDto {
  name: string;
  oib: string;
  street: string;
  postalZone: string;
  city: string;
  countryCode: string;
  contactName?: string;
  contactOib?: string;
  phone?: string;
  email?: string;
}

export class InvoiceDetailsCustomerDto {
  name: string;
  oib: string;
  street: string;
  postalZone: string;
  city: string;
  countryCode: string;
}

export class InvoiceDetailsPaymentMeansDto {
  code: string;
  dueDate: string;
  channelCode?: string;
  iban?: string;
  accountCurrencyCode?: string;
  paymentId?: string;
  instructionNote?: string;
}

export class InvoiceDetailsLineDto {
  id: string;
  name: string;
  description: string;
  classificationCode?: string;
  quantity: number;
  unitCode: string;
  unitPrice: string;
  vatCategory: string;
  lineExtensionAmount: string;
}

export class InvoiceDetailsTaxSubtotalDto {
  categoryId: string;
  percent: number;
  taxableAmount: string;
  taxAmount: string;
  taxExemptionReason?: string;
}

export class InvoiceDetailsMonetaryDto {
  lineExtensionAmount: string;
  taxExclusiveAmount: string;
  taxInclusiveAmount: string;
  prepaidAmount?: string;
  payableAmount: string;
}

export class InvoiceDetailsReportDto {
  billNumber: string;
  billDate: string;
  copyIndicator?: boolean;
  invoiceTypeCode: string;
  currencyCode: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  orderReferenceId?: string;
  customizationId?: string;
  profileId?: string;
  invoiceNote?: string;
  supplier: InvoiceDetailsSupplierDto;
  customer: InvoiceDetailsCustomerDto;
  paymentMeans: InvoiceDetailsPaymentMeansDto;
  lines: InvoiceDetailsLineDto[];
  taxSubtotals: InvoiceDetailsTaxSubtotalDto[];
  taxTotalAmount: string;
  monetary: InvoiceDetailsMonetaryDto;
}
