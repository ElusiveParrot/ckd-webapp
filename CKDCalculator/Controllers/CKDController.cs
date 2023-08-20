using CKDCalculator.Data;
using CKDCalculator.Services;
using Microsoft.AspNetCore.Mvc;

namespace CKDCalculator.Controllers;

public abstract class CKDController : ControllerBase
{
    protected readonly IMeasurementRepository _measurementsRepository;
    protected readonly IUserRepository        _usersRepository;
    
    protected readonly EmailService _emailService;
    protected readonly JwtService   _jwtService;
    
    protected CKDController(IMeasurementRepository measurementsRepository, IUserRepository usersRepository,
                            EmailService emailService, JwtService jwtService)
    {
        _measurementsRepository = measurementsRepository;
        _usersRepository        = usersRepository;

        _emailService = emailService;
        _jwtService   = jwtService;
    }
}