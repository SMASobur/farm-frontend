import { apiClient } from './client';
import type { ApiResponse, MonthlyReport } from '@/types';

export async function getReport(from: string, to: string): Promise<ApiResponse<MonthlyReport>> {
    const response = await apiClient.get<ApiResponse<MonthlyReport>>(
        `/api/reports?from=${from}&to=${to}`
    );
    return response.data;
}

/**
 * Downloads the report as Excel. Uses authenticated fetch to include JWT,
 * then triggers a browser download via a Blob URL.
 */
export async function downloadReportExcel(from: string, to: string): Promise<void> {
    const response = await apiClient.get(
        `/api/reports/export.xlsx?from=${from}&to=${to}`,
        { responseType: 'blob' }
    );
    triggerDownload(response.data, `farm-report-${from}-to-${to}.xlsx`);
}

/**
 * Downloads the report as PDF.
 */
export async function downloadReportPdf(from: string, to: string): Promise<void> {
    const response = await apiClient.get(
        `/api/reports/export.pdf?from=${from}&to=${to}`,
        { responseType: 'blob' }
    );
    triggerDownload(response.data, `farm-report-${from}-to-${to}.pdf`);
}

function triggerDownload(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}