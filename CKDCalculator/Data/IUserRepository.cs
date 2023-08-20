using System.Linq.Expressions;
using CKDCalculator.Models;
using CKDCalculator.Services;

namespace CKDCalculator.Data;

public interface IUserRepository
{
    User Create(User user);

    bool Exists(User userToBeCreated);

    void Update();
    
    User? GetByEmail(string email);
    User? GetByNhsNumber(long nhsNumber);
    User? GetByProfessionalId(long professionalId);
    User? GetById(int id);
    IReadOnlyList<User> GetBySupervisor(int supervisorId);
    User? GetFromJwtToken(string token, JwtService service);

    IReadOnlyList<User> GetWithFilter(Expression<Func<User, bool>> where);
}
