using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Http;
using PdfPortal.Application.Interfaces;
using PdfPortal.Application.Models;
using System.Text;
using System.Text.Json;

namespace PdfPortal.Infrastructure.Services;

public class GptService : IGptService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly string? _model;

    public GptService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
        
        // Priority: Environment Variables > appsettings.json
        _apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") 
            ?? _configuration["OpenAI:ApiKey"];
        _model = Environment.GetEnvironmentVariable("OPENAI_MODEL") 
            ?? _configuration["OpenAI:Model"] 
            ?? "gpt-4-turbo-preview";
        
        if (string.IsNullOrEmpty(_apiKey))
        {
            Console.WriteLine("[GptService] WARNING: OpenAI API key not configured");
            Console.WriteLine("[GptService] Please set OPENAI_API_KEY in .env file or appsettings.json");
        }
        else
        {
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "PdfPortal/1.0");
            Console.WriteLine($"[GptService] ✓ OpenAI API configured (Model: {_model})");
        }
    }

    public async Task<GptExtractionResult> ExtractDocumentInfoAsync(byte[] pdfBytes, string prompt)
    {
        var result = new GptExtractionResult();
        
        try
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                result.Success = false;
                result.ErrorMessage = "OpenAI API key not configured";
                return result;
            }

            Console.WriteLine("[GptService] Starting GPT extraction...");
            
            // Convert PDF bytes to base64
            string base64Pdf = Convert.ToBase64String(pdfBytes);
            
            // Prepare the GPT request
            var requestBody = new
            {
                model = _model,
                messages = new object[]
                {
                    new
                    {
                        role = "system",
                        content = "You are an expert at extracting information from PDF documents. Extract all text content and provide structured information including title, summary, and contact information. Return your response in JSON format with the following structure: {\"title\": \"...\", \"summary\": \"...\", \"contactInformation\": \"...\", \"extractedText\": \"...\"}"
                    },
                    new
                    {
                        role = "user",
                        content = new object[]
                        {
                            new { type = "text", text = prompt },
                            new
                            {
                                type = "image_url",
                                image_url = new
                                {
                                    url = $"data:application/pdf;base64,{base64Pdf}"
                                }
                            }
                        }
                    }
                },
                max_tokens = 4000,
                temperature = 0.3
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            Console.WriteLine("[GptService] Sending request to OpenAI API...");
            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[GptService] API error: {response.StatusCode} - {errorContent}");
                result.Success = false;
                result.ErrorMessage = $"OpenAI API error: {response.StatusCode}";
                return result;
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var gptResponse = JsonSerializer.Deserialize<GptApiResponse>(responseContent);

            if (gptResponse?.Choices == null || gptResponse.Choices.Length == 0)
            {
                result.Success = false;
                result.ErrorMessage = "No response from GPT";
                return result;
            }

            var gptMessage = gptResponse.Choices[0].Message?.Content;
            if (string.IsNullOrEmpty(gptMessage))
            {
                result.Success = false;
                result.ErrorMessage = "Empty response from GPT";
                return result;
            }

            Console.WriteLine($"[GptService] GPT response received: {gptMessage.Substring(0, Math.Min(200, gptMessage.Length))}...");

            // Try to parse JSON response
            try
            {
                // Remove markdown code blocks if present
                gptMessage = gptMessage.Trim();
                if (gptMessage.StartsWith("```json"))
                {
                    gptMessage = gptMessage.Substring(7);
                }
                if (gptMessage.StartsWith("```"))
                {
                    gptMessage = gptMessage.Substring(3);
                }
                if (gptMessage.EndsWith("```"))
                {
                    gptMessage = gptMessage.Substring(0, gptMessage.Length - 3);
                }
                gptMessage = gptMessage.Trim();

                var extractedData = JsonSerializer.Deserialize<GptExtractedData>(gptMessage);
                
                if (extractedData != null)
                {
                    result.Title = extractedData.Title ?? string.Empty;
                    result.Summary = extractedData.Summary ?? string.Empty;
                    result.ContactInformation = extractedData.ContactInformation ?? string.Empty;
                    result.ExtractedText = extractedData.ExtractedText ?? string.Empty;
                    result.Success = true;
                    
                    Console.WriteLine($"[GptService] Extraction successful - Title: {result.Title}, Summary length: {result.Summary.Length}");
                }
                else
                {
                    // Fallback: Use full response as extracted text
                    result.ExtractedText = gptMessage;
                    result.Success = true;
                    Console.WriteLine("[GptService] Could not parse structured data, using full response as text");
                }
            }
            catch (JsonException ex)
            {
                // If JSON parsing fails, use the full response as extracted text
                Console.WriteLine($"[GptService] JSON parsing failed, using full response: {ex.Message}");
                result.ExtractedText = gptMessage;
                result.Success = true;
            }

            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GptService] Error: {ex.Message}");
            result.Success = false;
            result.ErrorMessage = ex.Message;
            return result;
        }
    }

    private class GptApiResponse
    {
        public GptChoice[]? Choices { get; set; }
    }

    private class GptChoice
    {
        public GptMessage? Message { get; set; }
    }

    private class GptMessage
    {
        public string? Content { get; set; }
    }

    private class GptExtractedData
    {
        public string? Title { get; set; }
        public string? Summary { get; set; }
        public string? ContactInformation { get; set; }
        public string? ExtractedText { get; set; }
    }
}

