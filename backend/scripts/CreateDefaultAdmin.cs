using Microsoft.EntityFrameworkCore;
using PdfPortal.Infrastructure.Data;
using PdfPortal.Application.Services;
using PdfPortal.Domain.Entities;
using System.Security.Cryptography;
using System.Text;

namespace PdfPortal.Scripts;

public class CreateDefaultAdmin
{
    public static async Task CreateAdminUser()
    {
        var connectionString = "Host=localhost;Database=pdfportal;Username=postgres;Password=123";
        
        var options = new DbContextOptionsBuilder<PdfPortalDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        using var context = new PdfPortalDbContext(options);

        // Check if admin already exists and delete it
        var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
        if (existingAdmin != null)
        {
            Console.WriteLine("Deleting existing admin user...");
            context.Users.Remove(existingAdmin);
            await context.SaveChangesAsync();
        }

        // Create default admin user with simple SHA256 hash (matching the old implementation)
        var admin = new User
        {
            Email = "admin@admin.com",
            PasswordHash = HashPassword("Admin123!"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(admin);
        await context.SaveChangesAsync();

        Console.WriteLine("Default admin user created:");
        Console.WriteLine("Email: admin@admin.com");
        Console.WriteLine("Password: Admin123!");
    }

    private static string HashPassword(string password)
    {
        // Generate salt
        var saltBytes = new byte[16];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(saltBytes);
        var salt = Convert.ToBase64String(saltBytes);

        // Hash password with salt
        var passwordBytes = Encoding.UTF8.GetBytes(password);
        var combinedBytes = new byte[saltBytes.Length + passwordBytes.Length];
        
        Array.Copy(saltBytes, 0, combinedBytes, 0, saltBytes.Length);
        Array.Copy(passwordBytes, 0, combinedBytes, saltBytes.Length, passwordBytes.Length);

        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(combinedBytes);
        var hash = Convert.ToBase64String(hashBytes);

        return $"{salt}:{hash}";
    }
}
