using Microsoft.AspNetCore.Hosting;
using PdfPortal.Application.Interfaces;

namespace PdfPortal.Infrastructure.Services;

public class PdfStorageService : IPdfStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly string _originalPath;
    private readonly string _processedPath;
    private readonly string _tempPath;

    public PdfStorageService(IWebHostEnvironment environment)
    {
        _environment = environment;
        _originalPath = Path.Combine(_environment.ContentRootPath, "storage", "original");
        _processedPath = Path.Combine(_environment.ContentRootPath, "storage", "processed");
        _tempPath = Path.Combine(_environment.ContentRootPath, "storage", "temp");

        // Ensure directories exist
        Directory.CreateDirectory(_originalPath);
        Directory.CreateDirectory(_processedPath);
        Directory.CreateDirectory(_tempPath);
    }

    public async Task<string> SaveOriginalPdfAsync(Stream pdfStream, string fileName)
    {
        var guid = Guid.NewGuid();
        var filePath = Path.Combine(_originalPath, $"{guid}.pdf");
        
        using var fileStream = new FileStream(filePath, FileMode.Create);
        await pdfStream.CopyToAsync(fileStream);
        
        return filePath;
    }

    public async Task<string> SaveProcessedPdfAsync(byte[] pdfBytes, string fileName)
    {
        var guid = Guid.NewGuid();
        var filePath = Path.Combine(_processedPath, $"{guid}.pdf");
        
        await File.WriteAllBytesAsync(filePath, pdfBytes);
        
        return filePath;
    }

    public async Task<byte[]> GetProcessedPdfAsync(string filePath)
    {
        if (!File.Exists(filePath))
            throw new FileNotFoundException($"Processed PDF not found: {filePath}");
            
        return await File.ReadAllBytesAsync(filePath);
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        try
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                return true;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> GetTempFilePathAsync(string tempId)
    {
        var filePath = Path.Combine(_tempPath, $"{tempId}.pdf");
        return await Task.FromResult(filePath);
    }
}
