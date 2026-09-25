import { ChevronDown, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { RecordExportDefinition, RecordFilterKind } from './filter.types';
import { toCsv } from '@/shared/file/csv';
import { downloadText } from '@/shared/file/download';
import { printWindow } from '@/shared/file/print';
import { toast } from '@/shared/ui/feedback/Toaster';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay/DropdownMenu';

export const CSV_MIME = 'text/csv;charset=utf-8';
export const EXCEL_MIME = 'application/vnd.ms-excel';

const slug = (label: string) =>
  label.toLocaleLowerCase().replaceAll(/[^a-z0-9]+/g, '-');

export function recordExportFilename(
  label: string,
  extension: 'csv' | 'xls',
  mode: 'export' | 'report',
) {
  return mode === 'report'
    ? `${slug(label)}-report-2026-07-28.${extension}`
    : `${slug(label)}-export.${extension}`;
}

type RecordExportProps = Readonly<{
  compact?: boolean;
  definition?: RecordExportDefinition;
  kind: RecordFilterKind;
  mode?: 'export' | 'report';
}>;

export function RecordExport({
  compact,
  definition,
  kind,
  mode = 'export',
}: RecordExportProps) {
  const { t } = useTranslation('organization');
  const data =
    definition ??
    ({ columns: ['Reference', 'Record', 'Date', 'Status'], label: kind, rows: [] } as const);

  const download = (extension: 'csv' | 'xls', mimeType: string) => {
    const filename = recordExportFilename(data.label, extension, mode);
    downloadText(toCsv(data.columns, data.rows), filename, mimeType);
    toast(t('export.exported', { filename }));
  };

  const print = () => {
    toast(t('export.openingPrint'));
    window.setTimeout(printWindow, 400);
  };

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button
          className={
            compact
              ? 'inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink'
              : 'inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink'
          }
          type="button"
        >
          <Download aria-hidden="true" size={13} />
          <span>{t('export.action')}</span>
          <ChevronDown aria-hidden="true" size={12} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => { download('xls', EXCEL_MIME); }}>
          <Download aria-hidden="true" size={13} />
          {t('export.excel')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { download('csv', CSV_MIME); }}>
          <Download aria-hidden="true" size={13} />
          {t('export.csv')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={print}>
          <Download aria-hidden="true" size={13} />
          {t('export.pdf')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={print}>
          <Download aria-hidden="true" size={13} />
          {t('export.print')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
