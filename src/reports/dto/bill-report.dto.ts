export class BillReportDto {
  recipientName: string;
  recipientAddress: string;
  recipientPost: string;
  recipientCity: string;
  recipientOib: string;
  billNumber: string;
  billDate: string;
  billProjectDescription: string;
  billProjectName: string;
  billBasePrice: string;
  billPdvPrice?: string;
  billTotalPrice: string;
  billReverseCharge?: boolean;
  paymentDays: number;
  billTotalText: string;
  billTime: string;
  pdf417Image?: string;
  zki?: string;
  jir?: string;
}
