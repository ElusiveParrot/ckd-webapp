using CKDCalculator.Data;
using CKDCalculator.DTOs;
using CKDCalculator.Models;
using CKDCalculator.Services;
using CKDCalculator.Utils;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace CKDCalculator.Controllers;

[Route("api/user")]
[ApiController]
public class UserController : CKDController
{
    public UserController(IMeasurementRepository measurementsRepository, IUserRepository usersRepository,
                          EmailService emailService, JwtService jwtService) 
        : base(measurementsRepository, usersRepository, emailService, jwtService)
    {
    }
    
    /***
     * /api/user/measure
     * 
     * Calculate user's GFR using provided creatinine.
     * 
     * JSON Request:
     * Creatinine -> User's creatinine from blood tests as float
     * NhsNumber  -> Target patient's NHS number, only provide when logged in as clinician and doing test for patient
     *
     * Note: Creatinine is accepted in umol/L, should user choose different unit the frontend should convert it
     *       to umol/L before creating a request.
     * 
     * Returns:
     * Unauthorised (401) -> User is not logged in, insufficient permissions
     * BadRequest (400)   -> Invalid creatinine value (< 1)
     * Created (201)      -> Measurement saved in the database, saved measurement's data is returned as newMeasurement in JSON
     */
    [HttpPost("measure")]
    public IActionResult Measure(UserMeasurementDto dto)
    {
        string? cookieToken = Request.Cookies["jwt"];

        if (cookieToken == null)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "User is not logged in")
                }
            }));
        }

        User? user = _usersRepository.GetFromJwtToken(cookieToken, _jwtService);
        if (user == null)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "User is not logged in")
                }
            }));
        }

        // There's an extra check of result below, this is just so the API doesn't crash because of division by 0
        if (dto.Creatinine < 1.0)
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Creatinine", "Creatinine value is invalid")
                    #if DEBUG
                    ,new ApiErrorResponse<string>("Debug", $"Creatinine provided: {dto.Creatinine}, " +
                                                  "it needs to be higher than 1.0. For testing use 66.0")
                    #endif
                }
            }));
        }


        if (user.Access == Models.User.AccessLevel.Patient && dto.PatientNhsNumber != null)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Insufficient permissions")
                }
            }));
        }
        
        if (user.Access == Models.User.AccessLevel.Clinician)
        {
            if (dto.PatientNhsNumber == null)
            {
                return BadRequest(JsonConvert.SerializeObject(new
                {
                    status = "failure",
                    errors = new[]
                    {
                        new ApiErrorResponse<string>("APIInternal", "API Error: Missing patient's NHS number")
                    }
                }));
            }

            int clinicianId = user.Id;
            user = _usersRepository.GetByNhsNumber((int) dto.PatientNhsNumber);
            if (user == null)
            {
                return BadRequest(JsonConvert.SerializeObject(new
                {
                    status = "failure",
                    errors = new[]
                    {
                        new ApiErrorResponse<string>("Generic", "Target user not found")
                    }
                }));
            }

            if (user.SupervisorId != clinicianId)
            {
                return Unauthorized(JsonConvert.SerializeObject(new
                {
                    status = "failure",
                    errors = new[]
                    {
                        new ApiErrorResponse<string>("Generic", "Insufficient Permissions")
                    }
                }));
            }
        }

        double result = MedicalHelper.CalculateKidneyFunction(dto.Creatinine, user.DoB, user.Gender, user.IsBlack);
        // While the usual range is 0-120 the result can sometimes be above 120 due to 'Hyperfiltration' so 200 is a safe limit
        if (result is > 200 or < 0)
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Creatinine",
                        "Result above/below the range, check your creatinine value")
                    #if DEBUG
                    ,new ApiErrorResponse<string>("Debug", $"Result: {result}")
                    #endif
                }
            }));
        }

        Measurement measurement = new()
        {
            User        = user,
            DateAndTime = DateTime.Now,
            Result      = result
        };

        Measurement newMeasurement = _measurementsRepository.Create(measurement);
        return Created("", JsonConvert.SerializeObject(new
        {
            status = "success",
            newMeasurement
        }));
    }

    /***
     * /api/user/info
     * 
     * Get currently logged in user's data.
     * 
     * JSON Request:
     * Empty
     * 
     * Returns:
     * Unauthorised (401) -> User is not logged in
     * Ok (200)           -> User is logged in, data returned
     */
    [HttpGet("info")]
    public IActionResult Info()
    {
        string? cookieToken = Request.Cookies["jwt"];

        if (cookieToken == null)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "User is not logged in")
                }
            }));
        }

        User? user = _usersRepository.GetFromJwtToken(cookieToken, _jwtService);
        if (user == null)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "User is not logged in")
                }
            }));
        }
        
        return Ok(JsonConvert.SerializeObject(new
        {
            status = "success",
            user
        }));
    }
    
    /***
     * /api/user/measurements
     * 
     * Get user's GFR measurements
     * 
     * JSON Request:
     * Empty
     * 
     * Returns:
     * Unauthorised (401) -> User is not logged in
     * Ok (200)           -> Measurements returned
     */
    [HttpGet("measurements")]
    public IActionResult Measurements()
    {
        string? cookieToken = Request.Cookies["jwt"];

        if (cookieToken == null)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "User is not logged in")
                }
            }));
        }

        User? user = _usersRepository.GetFromJwtToken(cookieToken, _jwtService);
        if (user == null)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "User is not logged in")
                }
            }));
        }

        return Ok(JsonConvert.SerializeObject(new
        {
            status       = "success",
            measurements = _measurementsRepository.GetByUser(user)
        }));
    }

    /***
     * /api/user/logout
     * 
     * Logs out current user.
     * 
     * JSON Request:
     * Empty
     * 
     * Returns:
     * Ok (200) -> User is now logged out.
     */
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt"); // TODO Can this throw if token doesnt exist? check

        return Ok(JsonConvert.SerializeObject(new
        {
            status = "success"
        }));
    }
}
