namespace CKDCalculator.Utils;

public class ApiErrorResponse<T>
{
    public string Type { get; set; }
    
    public T Data { get; set; }

    public ApiErrorResponse(string type, T data)
    {
        Type = type;
        Data = data;
    }
}