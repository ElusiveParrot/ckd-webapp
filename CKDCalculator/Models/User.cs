using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.RegularExpressions;
using CKDCalculator.Utils;

namespace CKDCalculator.Models;

public class User : IModel
{
    public const string EmailRegex =
        "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?" + 
        "(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";

    private const string PasswordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\w\\W]{8,15}$";

    public enum AccessLevel
    {
        Patient,
        Clinician,
        Manager,
        Sysadmin
    }

    public int Id { get; set; }
    
    public int? SupervisorId { get; set; }
    /*
     * TODO
     * Change below to ID only
     * https://stackoverflow.com/questions/20886049/ef-code-first-foreign-key-without-navigation-property
     * Do the same for Measurements for performance
     */
    [ForeignKey("SupervisorId")]
    public User? Supervisor { get; set; }

    [EmailAddress]
    public string Email { get; set; }
    public long? ProfessionalId { get; set; }
    public long? NhsNumber { get; set; }
    
    public string Password { get; set; }
    
    public AccessLevel Access { get; set; }

    public string Name { get; set; }
    public string Surname { get; set; }
    
    public Gender Gender { get; set; }
    
    public bool IsBlack { get; set; }
    
    public DateTime DoB { get; set; }
    
    public IReadOnlyList<ApiErrorResponse<string>> Validate(bool skipPassword)
    {
        List<ApiErrorResponse<string>> errors = new();
        
        // TODO move some validation to [Attributes]

        int age = MedicalHelper.YearsPassedFrom(DoB);
        if (age is < 18 or > 110)
            errors.Add(new ApiErrorResponse<string>("dob", 
                "You need to be between 18 and 110 years old to use this calculator"));

        if (Access == AccessLevel.Patient)
        {
            // NHS number needs to have 10 digits so minimum 'value' of NHS number is 1000000000
            if (NhsNumber == null || NhsNumber / 1000000000 < 1.0)
                errors.Add(new ApiErrorResponse<string>("nhs", "Invalid NHS number format"));
        }
        else
        {
            // ProfessionalId format is the same as NHS number
            if (ProfessionalId == null || ProfessionalId / 1000000000 < 1.0)
                errors.Add(new ApiErrorResponse<string>("professionalId", "Invalid professional ID format"));
        }

        if (string.IsNullOrWhiteSpace(Email) || !Regex.IsMatch(Email.ToLower().Trim(), EmailRegex))
            errors.Add(new ApiErrorResponse<string>("email", "Invalid e-mail address"));

        if (!skipPassword)
        {
            if (string.IsNullOrWhiteSpace(Password) || !Regex.IsMatch(Password.Trim(), PasswordRegex))
                errors.Add(new ApiErrorResponse<string>("pswd",
                    "Invalid password, needs at least one upper-case letter, one number " +
                    "and needs to be between 8 and 15 characters"));
        }

        if (string.IsNullOrWhiteSpace(Name) || !Name.All(char.IsLetter))
            errors.Add(new ApiErrorResponse<string>("fname", "Invalid name format"));

        if (string.IsNullOrWhiteSpace(Surname) || !Surname.All(char.IsLetter))
            errors.Add(new ApiErrorResponse<string>("sname", "Invalid surname format"));

        if (Gender != Gender.Male && Gender != Gender.Female)
            errors.Add(new ApiErrorResponse<string>("gender", "API Error: wrong gender ID in request"));
            
        return errors;
    }
}
