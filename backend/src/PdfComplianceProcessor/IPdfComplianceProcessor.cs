namespace PdfComplianceProcessor;

/// <summary>
/// Interface for PDF compliance processing
/// </summary>
public interface IPdfComplianceProcessor
{
    /// <summary>
    /// Processes and normalizes a PDF for compliance
    /// </summary>
    /// <param name="request">The PDF compliance request</param>
    /// <returns>The compliance processing result</returns>
    PdfComplianceResult ProcessAndNormalize(PdfComplianceRequest request);
}
