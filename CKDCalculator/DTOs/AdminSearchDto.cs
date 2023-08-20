namespace CKDCalculator.DTOs;

public class AdminSearchDto
{
    public string? FirstName { get; set; }
    public string? Surname { get; set; }
    
    public int? OffsetStart { get; set; }
    public int? OffsetEnd   { get; set; }
}