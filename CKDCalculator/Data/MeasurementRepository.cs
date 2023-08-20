using CKDCalculator.Models;

namespace CKDCalculator.Data;

public class MeasurementRepository : IMeasurementRepository
{
    private readonly PatientDatabaseContext _context;

    public MeasurementRepository(PatientDatabaseContext context)
    {
        _context = context;
    }
    
    public Measurement Create(Measurement measurement)
    {
        _context.Measurements.Add(measurement);
        
        measurement.Id = _context.SaveChanges();

        return measurement;
    }

    public IReadOnlyList<Measurement> GetByUser(User user) 
        => _context.Measurements.Where(measurement => measurement.User.Id == user.Id).ToList();
}
