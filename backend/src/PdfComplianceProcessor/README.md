# PdfComplianceProcessor

A .NET 8 class library for processing PDFs to ensure compliance with government standards.

## Features

- **PDF Validation**: Validates PDF header and basic structure
- **File Size Compliance**: Ensures PDFs are under 3MB
- **Format Normalization**: Converts to grayscale 8-bit, 300 DPI
- **Content Sanitization**: Removes JavaScript, forms, attachments, passwords
- **Data Extraction**: Extracts business fields (RFC, monto_total, periodo, etc.)
- **Compliance Reporting**: Generates detailed validation reports

## Usage

```csharp
using PdfComplianceProcessor;

// Create a request
var request = new PdfComplianceRequest
{
    OriginalPdfBytes = pdfFileBytes,
    TemplateName = "InvoiceTemplate",
    VendorEmail = "vendor@example.com"
};

// Process the PDF
var processor = new BasicPdfComplianceProcessor();
var result = processor.ProcessAndNormalize(request);

// Check results
if (result.IsCompliant)
{
    // PDF is compliant, use result.FinalPdfBytes
    Console.WriteLine("PDF is compliant!");
}
else
{
    // Check validation report for issues
    foreach (var item in result.ValidationReport)
    {
        Console.WriteLine($"{item.Key}: {item.Value}");
    }
}
```

## Models

### PdfComplianceRequest
- `byte[] OriginalPdfBytes`: The original PDF file bytes
- `string TemplateName`: Template name for processing
- `string VendorEmail`: Vendor email for context

### PdfComplianceResult
- `byte[] FinalPdfBytes`: Processed and normalized PDF bytes
- `Dictionary<string, string> ExtractedData`: Extracted business data
- `Dictionary<string, string> ValidationReport`: Compliance validation flags
- `bool IsCompliant`: Overall compliance status

## Validation Flags

- `isPdf`: Valid PDF header
- `grayscale8bit`: Converted to grayscale 8-bit
- `dpi300`: Normalized to 300 DPI
- `sizeUnder3MB`: File size under 3MB
- `noInteractiveContent`: No JavaScript, forms, or attachments

## Extracted Data Fields

- `RFC`: Tax identification number
- `monto_total`: Total amount
- `periodo`: Period/date range
- `vendor_email`: Vendor email
- `template_name`: Template used
- `processed_at`: Processing timestamp

## Implementation Notes

This is a basic implementation with placeholder logic. In production, you would:

1. Use a real PDF library (iText7, PdfPig) for text extraction
2. Implement actual grayscale conversion
3. Add real DPI normalization
4. Implement content sanitization
5. Add more sophisticated data extraction patterns
6. Add error handling and logging
7. Add configuration options
