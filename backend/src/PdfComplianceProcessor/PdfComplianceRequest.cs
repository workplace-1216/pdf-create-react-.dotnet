namespace PdfComplianceProcessor;

/// <summary>
/// Request model for PDF compliance processing
/// </summary>
public class PdfComplianceRequest
{
    /// <summary>
    /// The original PDF file bytes
    /// </summary>
    public byte[] OriginalPdfBytes { get; set; } = Array.Empty<byte>();

    /// <summary>
    /// The template name to use for processing
    /// </summary>
    public string TemplateName { get; set; } = string.Empty;

    /// <summary>
    /// The vendor email for context
    /// </summary>
    public string VendorEmail { get; set; } = string.Empty;
}
