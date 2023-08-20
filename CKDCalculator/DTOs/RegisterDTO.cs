using CKDCalculator.Utils;

namespace CKDCalculator.DTOs;

public class RegisterDto
{
    public long NhsNumber { get; set; }
    public string Email { get; set; }
    
    public string Password { get; set; }

    public string Name { get; set; }
    public string Surname { get; set; }
    
    public Gender Gender { get; set; }
    
    public bool IsBlack { get; set; }
    
    public DateTime DoB { get; set; }
}
