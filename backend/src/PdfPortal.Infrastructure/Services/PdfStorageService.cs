using Microsoft.AspNetCore.Hosting;
using PdfPortal.Application.Interfaces;

namespace PdfPortal.Infrastructure.Services;

public class PdfStorageService : IPdfStorageService
{
    private readonly IWebHostEnvironment _environment;

    public PdfStorageService(IWebHostEnvironment environment)
    {
        // Local filesystem storage is disabled. This class remains only to satisfy references
        // but should never be resolved in DI. Use CloudflareR2StorageService instead.
        _environment = environment;
    }

    public async Task<string> SaveOriginalPdfAsync(Stream pdfStream, string fileName)
    {
        // Delegate to Cloudflare R2 implementation to ensure cloud storage is always used
        var r2 = new CloudflareR2StorageService();
        return await r2.SaveOriginalPdfAsync(pdfStream, fileName);
    }

    public async Task<string> SaveProcessedPdfAsync(byte[] pdfBytes, string fileName)
    {
        var r2 = new CloudflareR2StorageService();
        return await r2.SaveProcessedPdfAsync(pdfBytes, fileName);
    }

    public async Task<byte[]> GetProcessedPdfAsync(string filePath)
    {
        var r2 = new CloudflareR2StorageService();
        return await r2.GetProcessedPdfAsync(filePath);
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        var r2 = new CloudflareR2StorageService();
        return await r2.DeleteFileAsync(filePath);
    }

    public async Task<string> GetTempFilePathAsync(string tempId)
    {
        // R2 doesn't use temp files; return a virtual key for consistency
        var r2 = new CloudflareR2StorageService();
        return await r2.GetTempFilePathAsync(tempId);
    }
}
