using CKDCalculator.Data;
using CKDCalculator.DTOs;
using CKDCalculator.Models;
using CKDCalculator.Services;
using CKDCalculator.Utils;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace CKDCalculator.Controllers;

[Route("api")]
[ApiController]
public class AuthenticationController : CKDController
{
    public AuthenticationController(IMeasurementRepository measurementsRepository, IUserRepository usersRepository,
                                    EmailService emailService, JwtService jwtService) 
        : base(measurementsRepository, usersRepository, emailService, jwtService)
    {
    }
    
    /***
     * /api/register
     * 
     * Create new user.
     * 
     * JSON Request:
     * NhsNumber -> 10 digit number that does NOT start with 0 as integer
     * Email     -> Valid e-mail as string
     * Password  -> Between 8 and 15 characters with minimum of 1 number and 1 upper-case and lower case chars, as string
     * Name      -> User's name as string
     * Surname   -> User's surname as string
     * Gender    -> User's gender, as string 'male' or 'female' as as integer 0 for male and 1 for female
     * IsBlack   -> Whether the user is of black race, as boolean or integer
     * DoB       -> User's date of birth, in standard JSON/JS date AND time format
     *
     * Returns:
     * BadRequest (400) -> User can't be created due to invalid details or it already exists
     * Created (201)    -> Successful 
     */
    [HttpPost("register")]
    public IActionResult Register(RegisterDto dto)
    {
        User user = new()
        {
            NhsNumber = dto.NhsNumber,
            Email     = dto.Email,
            Password  = dto.Password,
            Access    = CKDCalculator.Models.User.AccessLevel.Patient,
            Name      = dto.Name,
            Surname   = dto.Surname,
            Gender    = dto.Gender,
            IsBlack   = dto.IsBlack,
            DoB       = dto.DoB,
        };

        IReadOnlyList<ApiErrorResponse<string>> errors = user.Validate(false);
        if (errors.Any())
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors
            }));
        }

        // Updates password with hashed one after validation
        user.Password = Crypto.Hash(Crypto.Algorithm.Sha256, dto.Password);

        if (_usersRepository.Exists(user))
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                // TODO change to match other types (ApiErrorResponse)
                errors = new[] { "User already exist" }
            }));
        }
        
        User createdUser = _usersRepository.Create(user);

        return Created("", JsonConvert.SerializeObject(new
        {
            status = "success",
            createdUser
        }));
    }

    /***
     * /api/login
     * 
     * Authenticate the user.
     * 
     * JSON Request:
     * NhsNumber  -> 10 digit number that does NOT start with 0 as integer (optional)
     * Email      -> Valid e-mail as string (optional)
     * Password   -> User's password
     * RememberMe -> Whether the user selected "Remember Me" option, as boolean
     *
     * Note: Either NhsNumber of Email has to provided, you cannot use both or neither
     * 
     * Returns:
     * BadRequest (400) -> user does not exist, password is wrong or when you provide both/neither NhsNumber and Email
     * Ok (200)         -> Successful log in 
     */
    [HttpPost("login")]
    public IActionResult Login(LoginDto dto)
    {
        if ((dto.NhsNumber == null && dto.Email == null) ||
            (dto.NhsNumber != null && dto.Email != null))
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("InternalAPI", 
                        "API error: must provide either email or NHS number but can't provide both")
                }
            }));
        }

        User? foundUser = null;
        // Log in by e-mail
        if (dto.Email != null)
        {
            foundUser = _usersRepository.GetByEmail(dto.Email);
        }
        // Log in by NHS number
        else if (dto.NhsNumber != null)
        {
            foundUser = _usersRepository.GetByNhsNumber(dto.NhsNumber ?? 0);
        }

        if (foundUser == null)
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Invalid email/NHS number and/or password")
                }
            }));
        }
        
        string dtoPassword = Crypto.Hash(Crypto.Algorithm.Sha256, dto.Password);
        string dbPassword  = foundUser.Password;
        if (dtoPassword != dbPassword)
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Invalid email/NHS number and/or password")
                }
            }));
        }

        string jwtToken = _jwtService.Generate(foundUser.Id, dto.RememberMe);
        
        Response.Cookies.Append("jwt", jwtToken, new CookieOptions
        {
            HttpOnly = true
        });

        return Ok(JsonConvert.SerializeObject(new
        {
            status = "success"
        }));
    }
}
