using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using Microsoft.AspNetCore.Hosting;
using PdfPortal.Application.Interfaces;
using PdfPortal.Application.Models;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace PdfPortal.Infrastructure.Services;

public class PdfProcessingService : IPdfProcessingService
{
    private readonly IWebHostEnvironment _environment;

    public PdfProcessingService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> ProcessPdfAsync(string inputPdfPath, string templateJsonDefinition)
    {
        var outputPath = Path.Combine(_environment.WebRootPath, "processed", $"{Guid.NewGuid()}.pdf");
        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);

        using var inputStream = new FileStream(inputPdfPath, FileMode.Open);
        using var outputStream = new FileStream(outputPath, FileMode.Create);
        
        var pdfReader = new PdfReader(inputStream);
        var pdfWriter = new PdfWriter(outputStream);
        var pdfDocument = new PdfDocument(pdfReader, pdfWriter);
        var document = new Document(pdfDocument);

        // Basic processing - in a real implementation, this would apply template rules
        var template = JsonSerializer.Deserialize<Dictionary<string, object>>(templateJsonDefinition);
        
        // Add a simple header based on template
        if (template?.ContainsKey("header") == true)
        {
            var header = new Paragraph(template["header"].ToString())
                .SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER)
                .SetFontSize(16);
            document.Add(header);
        }

        document.Close();
        pdfDocument.Close();

        return outputPath;
    }

    public async Task<Dictionary<string, object>> ExtractDataFromPdfAsync(string pdfPath)
    {
        var extractedData = new Dictionary<string, object>();

        using var inputStream = new FileStream(pdfPath, FileMode.Open);
        var pdfReader = new PdfReader(inputStream);
        var pdfDocument = new PdfDocument(pdfReader);

        // Basic extraction - in a real implementation, this would use more sophisticated extraction
        var numberOfPages = pdfDocument.GetNumberOfPages();
        extractedData["pageCount"] = numberOfPages;
        extractedData["extractedAt"] = DateTime.UtcNow;
        extractedData["fileName"] = Path.GetFileName(pdfPath);

        // Extract text from first page as example
        var text = "";
        for (int i = 1; i <= Math.Min(numberOfPages, 1); i++)
        {
            var page = pdfDocument.GetPage(i);
            // This is a simplified extraction - real implementation would be more sophisticated
            text += $"Page {i} content extracted";
        }
        extractedData["extractedText"] = text;

        pdfDocument.Close();

        return extractedData;
    }

    public async Task<bool> ValidatePdfAsync(string pdfPath)
    {
        try
        {
            using var inputStream = new FileStream(pdfPath, FileMode.Open);
            var pdfReader = new PdfReader(inputStream);
            var pdfDocument = new PdfDocument(pdfReader);
            
            var isValid = pdfDocument.GetNumberOfPages() > 0;
            pdfDocument.Close();
            
            return isValid;
        }
        catch
        {
            return false;
        }
    }
}
