using CKDCalculator.Data;
using CKDCalculator.Services;
using Microsoft.EntityFrameworkCore;

namespace CKDCalculator;

internal static class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        
        // Add services to the container.
        builder.Services.AddCors();
        
        builder.Services.AddDbContext<PatientDatabaseContext>(
            options => options.UseMySQL(builder.Configuration.GetConnectionString("Default") ?? string.Empty)
            );
        builder.Services.AddControllers().AddNewtonsoftJson();
        builder.Services.AddEndpointsApiExplorer();
        
        // Add EF services
        builder.Services.AddScoped<IUserRepository,        UserRepository>();
        builder.Services.AddScoped<IMeasurementRepository, MeasurementRepository>();
        
        // Add other services
        builder.Services.AddScoped<EmailService>(
            _ => new EmailService(
                builder.Configuration.GetSection("EmailServiceSettings").Get<EmailService.EmailServiceSettings>())
            );
        builder.Services.AddScoped<JwtService>();

        WebApplication app = builder.Build();
        
        app.UseCors(x => x
            .AllowAnyMethod()
            .AllowAnyHeader()
            .SetIsOriginAllowed(_ => true)
            .AllowCredentials());
        
        app.UseHttpsRedirection();

        app.UseExceptionHandler(app.Environment.IsDevelopment() ? "/dev-error" : "/error");

        app.UseDefaultFiles();
        app.UseStaticFiles();
        
        app.UseAuthorization();
        
        app.MapControllers();
        app.MapFallbackToController("Index", "Fallback");

        app.Run();
    }
}