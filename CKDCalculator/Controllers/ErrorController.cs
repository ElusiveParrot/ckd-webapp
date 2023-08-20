using CKDCalculator.Data;
using CKDCalculator.Services;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace CKDCalculator.Controllers;

[Route("")]
[ApiController]
public class ErrorController : CKDController
{
    public ErrorController(IMeasurementRepository measurementsRepository, IUserRepository usersRepository,
                           EmailService emailService, JwtService jwtService) 
        : base(measurementsRepository, usersRepository, emailService, jwtService)
    {
    }
    
    /***
     * /error
     *
     * Used for unknown API errors in production, don't call directly.
     */
    [Route("/error")]
    public IActionResult ProductionError()
    {
        // TODO Log
        //var exceptionHandlerFeature = HttpContext.Features.Get<IExceptionHandlerFeature>()!;

        return StatusCode(500, "Internal server error.");
    }
    
    /***
     * /dev-error
     *
     * Used for API errors in development, don't call directly.
     */
    [Route("/dev-error")]
    public IActionResult DevelopmentError([FromServices] IHostEnvironment hostEnvironment)
    {
        if (!hostEnvironment.IsDevelopment())
        {
            return NotFound();
        }
        
        // TODO Log

        IExceptionHandlerFeature exceptionHandlerFeature = HttpContext.Features.Get<IExceptionHandlerFeature>()!;

        return Problem(detail: exceptionHandlerFeature.Error.StackTrace, title: exceptionHandlerFeature.Error.Message);
    }
}
