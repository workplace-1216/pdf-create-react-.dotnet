using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using PdfPortal.Application.Interfaces;
using PdfPortal.Application.Services;
using PdfPortal.Infrastructure.Data;
using PdfPortal.Infrastructure.Repositories;
using PdfPortal.Infrastructure.Services;
using System.Text;

namespace PdfPortal.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<PdfPortalDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPdfProcessingService, PdfProcessingService>();
        services.AddScoped<IPdfStorageService, PdfStorageService>();
        services.AddScoped<ITemplateProcessorService, TemplateProcessorService>();
        services.AddScoped<TemplateRuleParser>();
        services.AddScoped<JwtTokenService>();
        services.AddScoped<PasswordHasherService>();
        services.AddScoped<DocumentService>();
        services.AddScoped<TemplateService>();


        return services;
    }
}
