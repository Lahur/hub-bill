import { BillReportDto } from './bill-report.dto';
import { InvoiceDetailsReportDto } from './invoice-details-report.dto';

export class BillWithDetailsReportDto extends BillReportDto {
  details: InvoiceDetailsReportDto;
}
