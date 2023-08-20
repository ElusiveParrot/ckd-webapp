using CKDCalculator.Models;
using CKDCalculator.Utils;

namespace CKDCalculator.DTOs;

public class AdminEditDto
{
    public string Email { get; set; }

    public EditDetails NewDetails { get; set; }

    public class EditDetails
    {
        public string? Email { get; set; }
        
        public string? Name    { get; set; }
        public string? Surname { get; set; }
        
        public DateTime? DoB { get; set; }
        
        public Gender? Gender { get; set; }
        
        public bool? IsBlack { get; set; }
        
        // Sysadmin only
        public long? NhsNumber      { get; set; }
        public long? ProfessionalId { get; set; }
        
        public User.AccessLevel? AccessLevel { get; set; }
    }
}