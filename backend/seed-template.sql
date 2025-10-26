-- Insert a default template for PDF processing
INSERT INTO "TemplateRuleSets" ("Name", "JsonDefinition", "CreatedByUserId", "CreatedAt", "IsActive")
VALUES (
    'Default PDF Processing Template',
    '{
        "metadataRules": {
            "RFC": "RFC[\\s:]*([A-Z0-9]{12,13})",
            "periodo": "Per[ií]odo[\\s:]*([0-9]{2}/[0-9]{4})",
            "monto_total": "Total[\\s:]*\\$?([0-9,]+\\.[0-9]{2})"
        },
        "pageRules": {
            "keepPages": [1, 2, 3],
            "footerText": "Documento procesado el {{now}} por {{vendor.email}}"
        },
        "coverPage": {
            "enabled": true,
            "fields": {
                "title": "Factura Normalizada",
                "rfc": "{{RFC}}",
                "periodo": "{{periodo}}",
                "monto": "{{monto_total}}"
            }
        }
    }',
    1,
    NOW(),
    true
);
