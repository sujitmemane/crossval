import axios from 'axios';
import { apiClient, ApiError, type ApiEnvelope } from './api-client';

async function readErrorMessage(data: unknown, fallback: string) {
  if (data instanceof Blob) {
    try {
      const json = JSON.parse(await data.text()) as ApiEnvelope<null>;
      return json.message || fallback;
    } catch {
      return fallback;
    }
  }

  if (typeof data === 'object' && data !== null && 'message' in data) {
    return String((data as ApiEnvelope<null>).message);
  }

  return fallback;
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function filenameFromDisposition(header?: string) {
  const match = header?.match(/filename="([^"]+)"/);
  return match?.[1];
}

export async function downloadFile(
  path: string,
  params: Record<string, string>,
  fallbackFilename: string,
) {
  try {
    const response = await apiClient.get<Blob>(path, {
      params,
      responseType: 'blob',
    });

    const filename = filenameFromDisposition(response.headers['content-disposition']) ?? fallbackFilename;
    triggerBrowserDownload(response.data, filename);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const message = await readErrorMessage(error.response.data, 'Download failed');
      throw new ApiError(message, error.response.status);
    }

    throw error;
  }
}
