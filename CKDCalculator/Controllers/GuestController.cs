using System.Globalization;
using System.Text.RegularExpressions;
using CKDCalculator.Data;
using CKDCalculator.DTOs;
using CKDCalculator.Services;
using CKDCalculator.Utils;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace CKDCalculator.Controllers;

[Route("api/guest")]
[ApiController]
public class GuestController : CKDController
{
    public GuestController(IMeasurementRepository measurementsRepository, IUserRepository usersRepository,
                           EmailService emailService, JwtService jwtService) 
        : base(measurementsRepository, usersRepository, emailService, jwtService)
    {
    }

    /***
     *
     * /api/guest/measure
     * 
     * Calculate guest's GFR using provided creatinine and other data.
     * 
     * JSON Request:
     * Creatinine -> Guest's creatinine from blood tests as float
     * Gender     -> Guest's gender, as string 'male' or 'female' as as integer 0 for male and 1 for female
     * IsBlack    -> Whether the guest is of black race, as boolean or integer
     * DoB        -> Guest's date of birth, in standard JSON/JS date AND time format
     * NhsNumber  -> 10 digit number that does NOT start with 0 as integer (optional)
     * Email      -> Valid e-mail as string
     * Name       -> User's name as string (optional)
     * Surname    -> User's surname as string (optional)
     * 
     * Note: Creatinine is accepted in umol/L, should guest choose different unit the frontend should convert it
     *       to umol/L before creating a request.
     * 
     * Returns:
     * BadRequest (400) -> Invalid value/s (age not between 18 and 110 or creatinine value below 1)
     * Ok (200)         -> Returns result as plaintext float
     */
    [HttpPost("measure")]
    public IActionResult GuestMeasure(GuestMeasurementDto dto)
    {
        // There's an extra check of result below, this is just so the API doesn't crash because of division by 0
        if (dto.Creatinine < 1.0)
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Creatinine",
                        "Result above/below the range, check your creatinine value")
                    #if DEBUG
                    ,new ApiErrorResponse<string>("Debug", $"Creatinine provided: {dto.Creatinine}, " +
                                                           "it needs to be higher than 1.0. For testing use 66.0")
                    #endif
                }
            }));
        }
        
        // TODO Code below copied from "Model.User" so put it in a fn (same for Admin Controller)
        // TODO validate NhsNumber
        List<ApiErrorResponse<string>> errors = new();
        int age = MedicalHelper.YearsPassedFrom(dto.DoB);
        if (age is < 18 or > 110)
            errors.Add(new ApiErrorResponse<string>("dob", 
                "You need to be between 18 and 110 years old to use this calculator"));
        
        // NHS number needs to have 10 digits so minimum 'value' of NHS number is 1000000000
        if (dto.NhsNumber != null && (long) (dto.NhsNumber / 1000000000) < 1.0)
            errors.Add(new ApiErrorResponse<string>("nhs", "Invalid NHS number format"));
        
        if (dto.Email != null &&
            (string.IsNullOrWhiteSpace(dto.Email) ||
             !Regex.IsMatch(dto.Email.ToLower().Trim(), CKDCalculator.Models.User.EmailRegex)))
        {
            errors.Add(new ApiErrorResponse<string>("email", "Invalid e-mail address"));
        }

        if (dto.Name != null && (string.IsNullOrWhiteSpace(dto.Name) || !dto.Name.All(char.IsLetter)))
            errors.Add(new ApiErrorResponse<string>("fname", "Invalid name format"));

        if (dto.Surname != null & (string.IsNullOrWhiteSpace(dto.Surname) || !dto.Surname.All(char.IsLetter)))
            errors.Add(new ApiErrorResponse<string>("sname", "Invalid surname format"));

        if (errors.Any())
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors
            }));  
        }
        // ..

        // While the usual range is 0-120 the result can sometimes be above 120 due to 'Hyperfiltration' so 200 is a safe limit
        // TODO change result to INT here and everywhere
        double result = MedicalHelper.CalculateKidneyFunction(dto.Creatinine, dto.DoB, dto.Gender, dto.IsBlack);
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

        if (dto.Email != null)
        {
            UrlBuilder urlBuilder = new("https://ckd-calculator.azurewebsites.net");
            urlBuilder.AddParameter("From", "email");
            
            if (dto.Name != null) 
                urlBuilder.AddParameter("Name", dto.Name);
            
            if (dto.Surname != null) 
                urlBuilder.AddParameter("Surname", dto.Surname);
            
            if (dto.NhsNumber != null)
                urlBuilder.AddParameter("NhsNumber", dto.NhsNumber.ToString() ?? "0");
            
                        
            urlBuilder.AddParameter("Email",  dto.Email);
            urlBuilder.AddParameter("DoB",    dto.DoB.ToString("u", CultureInfo.GetCultureInfo("en-US")));
            urlBuilder.AddParameter("Gender", dto.Gender.ToString());
            urlBuilder.AddParameter("Result", result.ToString("G", CultureInfo.InvariantCulture));
            
            
            _emailService.Send(dto.Email, 
                "Your CKD calculator result.", 
                $"Hello {dto.Name ?? ""}  {dto.Surname ?? ""}\n\n" +
                      "Thank you for using our CKD calculator. Here are your results:\n\n" +
                     $"eGFR: {(int) Math.Floor(result)}\n\n" +
                      "If you would like to view more details about the result or register with our service " +
                      "to make your future calculation easier and for your clinician to be able to monitor them " +
                     $"please click here: {urlBuilder.Build()}"
                );
        }

        return Ok(JsonConvert.SerializeObject(new
        {
            status = "success",
            result
        }));
    }
}
