using System.Globalization;
using CKDCalculator.Data;
using CKDCalculator.DTOs;
using CKDCalculator.Models;
using CKDCalculator.Services;
using CKDCalculator.Utils;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace CKDCalculator.Controllers;

[Route("api/admin")]
[ApiController]
public class AdminController : CKDController
{
    public AdminController(IMeasurementRepository measurementsRepository, IUserRepository usersRepository,
                           EmailService emailService, JwtService jwtService) 
        : base(measurementsRepository, usersRepository, emailService, jwtService)
    {
    }
    
    /***
     * /api/admin/patients_measurements
     * 
     * Get clinician's patient's GFR measurements.
     * 
     * Query (url) Request:
     * NhsNumber  -> Target user's NHS number (optional)
     * Email      -> Target user's e-mail address (optional)
     *
     * Note: Either NhsNumber of Email has to provided, you cannot use both or neither
     * 
     * Returns:
     * BadRequest (400)   -> Both NHS number and e-mail provided or neither or patient not found
     * Unauthorised (401) -> Clinician is not logged in, or the logged in user is a patient
     * Ok (200)           -> Measurements returned
     */
    [HttpGet("patients_measurements")]
    public IActionResult PatientsMeasurements([FromQuery] PatientsMeasurementsDto dto)
    {
        string? cookieToken = Request.Cookies["jwt"];

        if (cookieToken == null)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Clinician is not logged in")
                }
            }));
        }

        User? clinician = _usersRepository.GetFromJwtToken(cookieToken, _jwtService);
        if (clinician == null)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Clinician is not logged in")
                }
            }));
        }

        if (clinician.Access != CKDCalculator.Models.User.AccessLevel.Clinician)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Logged in user is not a clinician")
                }
            }));
        }
        
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
        // Find by e-mail
        if (dto.Email != null)
        {
            foundUser = _usersRepository.GetByEmail(dto.Email);
        }
        // Find by NHS number
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
                    new ApiErrorResponse<string>("Generic", "Patient not found")
                }
            }));
        }

        if (clinician.Id != foundUser.SupervisorId)
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Patient is assigned to a different clinician")
                }
            }));
        }

        return Ok(JsonConvert.SerializeObject(new
        {
            status       = "success",
            measurements = _measurementsRepository.GetByUser(foundUser)
        }));
    }
    
    // Helper
    public IActionResult GetByAccess(User.AccessLevel required, User.AccessLevel searched)
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
        
        User? admin = _usersRepository.GetFromJwtToken(cookieToken, _jwtService);
        if (admin == null)
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

        if (admin.Access < required)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Insufficient permission")
                }
            }));
        }

        return Ok(JsonConvert.SerializeObject(new
        {
            status = "success",
            users = _usersRepository.GetWithFilter(u => u.Access == searched)
        }));
    }

    [HttpGet("managers")]
    public IActionResult Managers() =>
        GetByAccess(Models.User.AccessLevel.Sysadmin, Models.User.AccessLevel.Manager);
    
    [HttpGet("clinicians")]
    public IActionResult Clinicians() =>
        GetByAccess(Models.User.AccessLevel.Manager, Models.User.AccessLevel.Clinician);

    /***
     * /api/admin/subordinates
     * 
     * Get all subordinates assigned to logged in user.
     * 
     * JSON Request:
     * Empty
     * 
     * Returns:
     * Unauthorised (401) -> Clinician/manager/sysadmin is not logged in or logged in user is not a clinician/manager/sysadmin
     * Ok (200)           -> Returns a list of subordinates
     */
    [HttpGet("subordinates")]
    public IActionResult Subordinates()
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

        if (user.Access == CKDCalculator.Models.User.AccessLevel.Patient)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Logged in user is a patient")
                }
            }));   
        }

        IReadOnlyList<User> subordinates = _usersRepository.GetBySupervisor(user.Id);

        return Ok(JsonConvert.SerializeObject(new
        {
            status = "success",
            subordinates
        }));
    }

    /***
     * /api/admin/edit
     * 
     * Edit another/same user's data.
     * 
     * JSON Request:
     * Email      -> Target user's e-mail
     * NewDetails -> Object containing data to change, check the AdminEditDto
     *
     * 
     * Returns:
     * BadRequest (400)   -> Data validation failed
     * Unauthorised (401) -> Insufficient permissions or not logged in
     * Ok (200)           -> User updated
     */
    [HttpPost("edit")]
    public IActionResult Edit(AdminEditDto dto)
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
        
        User? admin = _usersRepository.GetFromJwtToken(cookieToken, _jwtService);
        if (admin == null)
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

        // Patient tries to edit someone else's details
        if (admin.Access == Models.User.AccessLevel.Patient && dto.Email != admin.Email)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Not enough permissions")
                }
            }));
        }
        
        User? targetUser = _usersRepository.GetByEmail(dto.Email);
        if (targetUser == null)
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("InternalAPI", "API Error: Target user not found")
                }
            }));
        }
        
        // Make it so you can't edit other people with same access level details unless you are editing your own profile
        if (dto.Email != admin.Email && targetUser.Access >= admin.Access)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Not enough permissions")
                }
            }));
        }

        // SYSADMIN only
        
        if (admin.Access != Models.User.AccessLevel.Sysadmin &&
            (dto.NewDetails.NhsNumber      != null ||
             dto.NewDetails.ProfessionalId != null ||
             dto.NewDetails.AccessLevel    != null))
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Not enough permissions")
                }
            }));
        }

        targetUser.NhsNumber      = dto.NewDetails.NhsNumber      ?? targetUser.NhsNumber;
        targetUser.ProfessionalId = dto.NewDetails.ProfessionalId ?? targetUser.ProfessionalId;
        targetUser.Access         = dto.NewDetails.AccessLevel    ?? targetUser.Access;
        targetUser.Email          = dto.NewDetails.Email          ?? targetUser.Email;
        targetUser.Name           = dto.NewDetails.Name           ?? targetUser.Name;
        targetUser.Surname        = dto.NewDetails.Surname        ?? targetUser.Surname;
        targetUser.DoB            = dto.NewDetails.DoB            ?? targetUser.DoB;
        targetUser.Gender         = dto.NewDetails.Gender         ?? targetUser.Gender;
        targetUser.IsBlack        = dto.NewDetails.IsBlack        ?? targetUser.IsBlack;
        
        // tODO check if professional id, nhs number or email already exist
        
        IReadOnlyList<ApiErrorResponse<string>> errors = targetUser.Validate(true);
        if (errors.Any())
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors
            }));
        }
        
        _usersRepository.Update();
        
        return Ok(JsonConvert.SerializeObject(new
        {
            status      = "success",
            changedUser = targetUser
        }));
    }

    /***
     * /api/admin/search
     * 
     * Search for users
     * 
     * Query (url) Request:
     * FirstName   -> Name to search for
     * Surname     -> Surname to search for
     * OffsetStart -> Index for starting value
     * OffsetEnd   -> Index for last value
     *
     * Note: One or both Name or surname has to provided
     * 
     * Returns:
     * BadRequest (400)   -> Neither name nor surname has been provided
     * Unauthorised (401) -> User is not logged in, or the logged in user is a patient
     * Ok (200)           -> Users returned
     */
    [HttpGet("search")]
    public IActionResult Search([FromQuery] AdminSearchDto dto)
    {
        if (dto.FirstName == null && dto.Surname == null)
        {
            /*
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("InternalAPI", "API Error: empty request")
                }
            }));
            */
            dto.FirstName = "";
            dto.Surname = "";
        }
        
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
        
        User? admin = _usersRepository.GetFromJwtToken(cookieToken, _jwtService);
        if (admin == null)
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

        IReadOnlyList<User> foundUsers;
        int totalUsersFound;
        // Clinicians and managers can only see people below them
        if (admin.Access is Models.User.AccessLevel.Clinician or Models.User.AccessLevel.Manager)
        {
            foundUsers = _usersRepository.GetWithFilter(u 
                => (u.SupervisorId == admin.Id &&
                    u.Name.ToLower().Contains((dto.FirstName ?? "").ToLower()) &&
                    u.Surname.ToLower().Contains((dto.Surname ?? "").ToLower())));

            totalUsersFound = foundUsers.Count;
        }
        // Sysadmins have access to everyone, allow pages
        else if (admin.Access == Models.User.AccessLevel.Sysadmin)
        {
            foundUsers = _usersRepository.GetWithFilter(u 
                => (u.Name.ToLower().Contains((dto.FirstName ?? "").ToLower()) &&
                    u.Surname.ToLower().Contains((dto.Surname ?? "").ToLower())));

            totalUsersFound = foundUsers.Count;
            int startIndex = dto.OffsetStart ?? 0;
            int endIndex = dto.OffsetEnd ?? totalUsersFound;

            startIndex = startIndex > totalUsersFound ? totalUsersFound : startIndex;
            endIndex   = endIndex   > totalUsersFound ? totalUsersFound : endIndex;

            if (startIndex > endIndex)
            {
                return BadRequest(JsonConvert.SerializeObject(new
                {
                    status = "failure",
                    errors = new[]
                    {
                        new ApiErrorResponse<string>("Generic", "Bad range format")
                    }
                }));
            }
            
            foundUsers = foundUsers.ToList().GetRange(startIndex, endIndex - startIndex);
        }
        // Patients can't search
        else
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Not enough permissions")
                }
            }));
        }

        return Ok(JsonConvert.SerializeObject(new
        {
            status = "success",
            totalUsersFound,
            foundUsers
        }));
    }

    /***
     * /api/admin/csv_calculator
     * 
     * Search for users
     * 
     * JSON Request:
     * Entries -> List of entries, each entry is in format of GuestMeasurementDto but with all fields non-optional
     * 
     * Returns:
     * BadRequest (400)   -> Invalid creatinine value in one or more entries
     * Unauthorised (401) -> User is not logged in, or the logged in user is not a clinician
     * Ok (200)           -> Results returned
     */
    [HttpPost("csv_calculator")]
    public IActionResult CSVCalculator(CsvCalculatorDto dto)
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
        
        User? admin = _usersRepository.GetFromJwtToken(cookieToken, _jwtService);
        if (admin == null)
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

        if (admin.Access != Models.User.AccessLevel.Clinician)
        {
            return Unauthorized(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Not enough permissions")
                }
            }));
        }

        List<double> results = new();
        int entryCounter = 0;
        List<Measurement> measurementsToAddToDb = new();
        foreach (CsvCalculatorDto.CsvMeasurementEntry entry in dto.Entries)
        {
            if (entry.Creatinine < 1.0)
            {
                return BadRequest(JsonConvert.SerializeObject(new
                {
                    status = "failure",
                    errors = new[]
                    {
                        new ApiErrorResponse<string>("Generic", 
                            $"Invalid or corrupted CSV file: Invalid creatinine value for entry {entryCounter + 1}")
                        #if DEBUG
                        ,new ApiErrorResponse<string>("Debug", $"Creatinine: {entry.Creatinine}, should be above 1.0")
                        #endif
                    }
                }));
            }
            
            User? entryUser = _usersRepository.GetByNhsNumber(entry.NhsNumber);
            // TODO make below code functions, it's almost the same as in UserController and GuestController
            double result = MedicalHelper.CalculateKidneyFunction(entry.Creatinine, entry.DoB, entry.Gender, entry.IsBlack);
            
            // Already registered
            if (entryUser != null)
            {
                results.Add(result);
                
                Measurement measurement = new()
                {
                    User        = entryUser,
                    DateAndTime = DateTime.Now,
                    Result      = result
                };

                measurementsToAddToDb.Add(measurement);
            }
            // Guest
            else
            {
                results.Add(result);
            }

            entryCounter++;
        }
        
        // Everything went OK so add all the measurements to the DB
        foreach (Measurement measurement in measurementsToAddToDb)
        {
            _measurementsRepository.Create(measurement);
        }

        return Ok(JsonConvert.SerializeObject(new
        {
            status = "success",
            results
        }));
    }

    /***
     * /api/admin/assign_supervisor
     * 
     * Search for users
     * 
     * JSON Request:
     * Slave  -> SlaveData object,  check AdminAssignSupervisorDto. This will be an user supervised by Master.
     * Master -> MasterData object, check AdminAssignSupervisorDto. This will be a new supervisor of Slave.
     *
     * Returns:
     * Unauthorised (401) -> User is not logged in, or insufficient permissions
     * Ok (200)           -> Success
     */
    [HttpPost("assign_supervisor")]
    public IActionResult AssignSupervisor(AdminAssignSupervisorDto dto)
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
        
        User? admin = _usersRepository.GetFromJwtToken(cookieToken, _jwtService);
        if (admin == null)
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

        // Get the supervisor data
        User? supervisor = _usersRepository.GetByProfessionalId(dto.Master.ProfessionalId);
        if (supervisor == null)
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("Generic", "Invalid target supervisor")
                }
            }));
        }
        
        // Get the subordinate data
        User? subordinate;
        // Assigning a clinician to a manager
        if (dto.Slave.ProfessionalId != null && dto.Slave.NhsNumber == null)
        {
            // Only sysadmin can do it
            if (admin.Access != Models.User.AccessLevel.Sysadmin)
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
            
            subordinate = _usersRepository.GetByProfessionalId((int) dto.Slave.ProfessionalId);
            if (subordinate == null)
            {
                return BadRequest(JsonConvert.SerializeObject(new
                {
                    status = "failure",
                    errors = new[]
                    {
                        new ApiErrorResponse<string>("Generic", "Invalid target subordinate")
                    }
                }));
            }
        }
        // Assigning patient to a clinician
        else if (dto.Slave.NhsNumber != null && dto.Slave.ProfessionalId == null)
        {
            // Only manager and sysadmin can do it
            if (admin.Access < Models.User.AccessLevel.Manager)
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

            subordinate = _usersRepository.GetByNhsNumber((int) dto.Slave.NhsNumber);
            if (subordinate == null)
            {
                return BadRequest(JsonConvert.SerializeObject(new
                {
                    status = "failure",
                    errors = new[]
                    {
                        new ApiErrorResponse<string>("Generic", "Invalid target subordinate")
                    }
                }));
            }
        }
        // Both filled in or both null
        else
        {
            return BadRequest(JsonConvert.SerializeObject(new
            {
                status = "failure",
                errors = new[]
                {
                    new ApiErrorResponse<string>("APIInternal",
                        "API Error: Both or neither NHS number and ProfessionalID provided")
                }
            }));
        }

        subordinate.SupervisorId = supervisor.Id;
        
        _usersRepository.Update();

        return Ok(JsonConvert.SerializeObject(new
        {
            status = "success"
        }));
    }
}