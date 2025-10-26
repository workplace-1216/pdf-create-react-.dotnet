using System.Text;

namespace PdfComplianceProcessor;

/// <summary>
/// Example usage of the PdfComplianceProcessor library
/// </summary>
public static class ExampleUsage
{
    /// <summary>
    /// Demonstrates how to use the PDF compliance processor
    /// </summary>
    public static void DemonstrateUsage()
    {
        // Create a sample PDF (in real usage, this would come from file upload)
        var samplePdfBytes = CreateSamplePdfBytes();

        // Create the request
        var request = new PdfComplianceRequest
        {
            OriginalPdfBytes = samplePdfBytes,
            TemplateName = "InvoiceTemplate",
            VendorEmail = "vendor@example.com"
        };

        // Create the processor
        var processor = new BasicPdfComplianceProcessor();

        // Process the PDF
        var result = processor.ProcessAndNormalize(request);

        // Display results
        Console.WriteLine("=== PDF Compliance Processing Results ===");
        Console.WriteLine($"Is Compliant: {result.IsCompliant}");
        Console.WriteLine();

        Console.WriteLine("=== Extracted Data ===");
        foreach (var item in result.ExtractedData)
        {
            Console.WriteLine($"{item.Key}: {item.Value}");
        }
        Console.WriteLine();

        Console.WriteLine("=== Validation Report ===");
        foreach (var item in result.ValidationReport)
        {
            Console.WriteLine($"{item.Key}: {item.Value}");
        }
        Console.WriteLine();

        Console.WriteLine($"Final PDF Size: {result.FinalPdfBytes.Length} bytes");
    }

    private static byte[] CreateSamplePdfBytes()
    {
        // Create a minimal PDF header for testing
        // In real usage, this would be an actual PDF file
        var pdfContent = @"%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Sample PDF Content) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF";

        return Encoding.UTF8.GetBytes(pdfContent);
    }
}
