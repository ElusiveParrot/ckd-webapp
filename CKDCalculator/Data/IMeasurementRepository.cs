using CKDCalculator.Models;

namespace CKDCalculator.Data;

public interface IMeasurementRepository
{
    Measurement Create(Measurement measurement);

    IReadOnlyList<Measurement> GetByUser(User user);
}
