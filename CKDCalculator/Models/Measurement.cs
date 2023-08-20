using CKDCalculator.Utils;

namespace CKDCalculator.Models;

public class Measurement : IModel
{
    public int Id { get; set; }
    public User User { get; set; }
    
    public DateTime DateAndTime { get; set; }
    
    public double Result { get; set; }

    public IReadOnlyList<ApiErrorResponse<string>> Validate(bool skip) => new List<ApiErrorResponse<string>>();
}
