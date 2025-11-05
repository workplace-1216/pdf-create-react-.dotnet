using Microsoft.EntityFrameworkCore;
using PdfPortal.Infrastructure.Data;
using PdfPortal.Domain.Entities;

// Create a simple script to add a default template
var connectionString = "Host=localhost;Database=pdfportal;Username=postgres;Password=123";

var options = new DbContextOptionsBuilder<PdfPortalDbContext>()
    .UseNpgsql(connectionString)
    .Options;

using var context = new PdfPortalDbContext(options);

// Check if templates already exist
var existingTemplates = await context.TemplateRuleSets.CountAsync();
if (existingTemplates == 0)
{
    var defaultTemplate = new TemplateRuleSet
    {
        Name = "Default PDF Processing Template",
        JsonDefinition = @"{
            ""metadataRules"": {
                ""RFC"": ""RFC[\\s:]*([A-Z0-9]{12,13})"",
                ""periodo"": ""Per[ií]odo[\\s:]*([0-9]{2}/[0-9]{4})"",
                ""monto_total"": ""Total[\\s:]*\\$?([0-9,]+\\.[0-9]{2})""
            },
            ""pageRules"": {
                ""keepPages"": [1, 2, 3],
                ""footerText"": ""Documento procesado el {{now}} por {{vendor.email}}""
            },
            ""coverPage"": {
                ""enabled"": true,
                ""fields"": {
                    ""title"": ""Factura Normalizada"",
                    ""rfc"": ""{{RFC}}"",
                    ""periodo"": ""{{periodo}}"",
                    ""monto"": ""{{monto_total}}""
                }
            }
        }",
        CreatedByUserId = 1,
        CreatedAt = DateTime.UtcNow,
        IsActive = true
    };

    context.TemplateRuleSets.Add(defaultTemplate);
    await context.SaveChangesAsync();
    Console.WriteLine("Default template added successfully!");
}
else
{
    Console.WriteLine($"Templates already exist ({existingTemplates} found)");
}
