namespace CKDCalculator.DTOs;

public class UserMeasurementDto
{
    public double Creatinine     { get; set; }     // umol/L, frontend should convert from other units
    public long? PatientNhsNumber { get; set; } // Only provided when measurement is done by clinician
}