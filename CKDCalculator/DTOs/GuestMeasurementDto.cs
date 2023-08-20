using CKDCalculator.Utils;

namespace CKDCalculator.DTOs;

public class GuestMeasurementDto
{
    public double Creatinine { get; set; } // umol/L, frontend should convert from other units
    
    public long? NhsNumber { get; set; }
    
    public string? Email { get; set; }

    public string? Name { get; set; }
    public string? Surname { get; set; }
    
    public DateTime DoB { get; set; }
    
    public Gender Gender { get; set; }
    
    public bool IsBlack { get; set; }
}