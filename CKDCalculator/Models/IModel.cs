using CKDCalculator.Utils;

namespace CKDCalculator.Models;

public interface IModel
{
    public IReadOnlyList<ApiErrorResponse<string>> Validate(bool skip);
}
