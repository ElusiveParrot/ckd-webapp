using System.IdentityModel.Tokens.Jwt;
using System.Linq.Expressions;
using CKDCalculator.Models;
using CKDCalculator.Services;

namespace CKDCalculator.Data;

public class UserRepository : IUserRepository
{
    private readonly PatientDatabaseContext _context;

    public UserRepository(PatientDatabaseContext context)
    {
        _context = context;
    }
    
    public User Create(User user)
    {
        _context.Users.Add(user);
        
        user.Id = _context.SaveChanges();

        return user;
    }

    public bool Exists(User userToBeCreated)
    {
        if (GetByEmail(userToBeCreated.Email) != null) 
            return true;
        
        if (userToBeCreated.NhsNumber != null && GetByNhsNumber((long) userToBeCreated.NhsNumber) != null)
            return true;
        
        if (userToBeCreated.ProfessionalId != null && GetByProfessionalId((long) userToBeCreated.ProfessionalId) != null)
            return true;

        return false;
    }

    public void Update() => _context.SaveChanges();

    public User? GetByEmail(string email) => _context.Users.FirstOrDefault(user => user.Email == email);

    public User? GetByNhsNumber(long nhsNumber) => _context.Users.FirstOrDefault(user => user.NhsNumber == nhsNumber);
    
    public User? GetByProfessionalId(long professionalId) =>
        _context.Users.FirstOrDefault(user => user.ProfessionalId == professionalId);

    public User? GetById(int id) => _context.Users.FirstOrDefault(user => user.Id == id);
    
    public IReadOnlyList<User> GetBySupervisor(int supervisorId) =>
        _context.Users.Where(user => user.SupervisorId == supervisorId).ToList();

    public User? GetFromJwtToken(string cookieToken, JwtService service)
    {
        int userId;

        try
        {
            JwtSecurityToken token = service.Verify(cookieToken);
            userId = int.Parse(token.Issuer);
        }
        catch (Exception)
        {
            // Log exception
            return null;
        }

        return GetById(userId);
    }

    public IReadOnlyList<User> GetWithFilter(Expression<Func<User, bool>> condition) => _context.Users.Where(condition).ToList();
}
