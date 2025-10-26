using PdfPortal.Scripts;

namespace PdfPortal.Scripts;

class Program
{
    static async Task Main(string[] args)
    {
        try
        {
            await CreateDefaultAdmin.CreateAdminUser();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
