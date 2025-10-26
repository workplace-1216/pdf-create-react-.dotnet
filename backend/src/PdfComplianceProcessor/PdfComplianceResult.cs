namespace PdfComplianceProcessor;

/// <summary>
/// Result model for PDF compliance processing
/// </summary>
public class PdfComplianceResult
{
    /// <summary>
    /// The final processed and normalized PDF bytes
    /// </summary>
    public byte[] FinalPdfBytes { get; set; } = Array.Empty<byte>();

    /// <summary>
    /// Extracted business data from the PDF
    /// </summary>
    public Dictionary<string, string> ExtractedData { get; set; } = new();

    /// <summary>
    /// Validation report with compliance flags
    /// </summary>
    public Dictionary<string, string> ValidationReport { get; set; } = new();

    /// <summary>
    /// Overall compliance status
    /// </summary>
    public bool IsCompliant { get; set; }
}
