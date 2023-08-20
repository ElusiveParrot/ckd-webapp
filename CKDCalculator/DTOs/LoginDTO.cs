namespace CKDCalculator.DTOs;

public class LoginDto
{
    public string? Email { get; set; }
    public long? NhsNumber { get; set; }

    public string Password { get; set; }

    public bool RememberMe { get; set; }
}