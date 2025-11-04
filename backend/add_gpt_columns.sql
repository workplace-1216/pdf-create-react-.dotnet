-- Make TemplateRuleSetId nullable
ALTER TABLE "DocumentProcessed" ALTER COLUMN "TemplateRuleSetId" DROP NOT NULL;

-- Add GPT columns
ALTER TABLE "DocumentProcessed" ADD COLUMN IF NOT EXISTS "GptContactInformation" TEXT NULL;
ALTER TABLE "DocumentProcessed" ADD COLUMN IF NOT EXISTS "GptSummary" TEXT NULL;
ALTER TABLE "DocumentProcessed" ADD COLUMN IF NOT EXISTS "GptTitle" TEXT NULL;

-- Insert migration history record
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20251104090820_AddGptFieldsToDocumentProcessed', '8.0.0')
ON CONFLICT DO NOTHING;

