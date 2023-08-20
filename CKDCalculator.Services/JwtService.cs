using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace CKDCalculator.Services;

public class JwtService
{
    private readonly string _secureKey = "<JWT_SECURE_KEY_PLACEHOLDER>";
    
    public string Generate(int id, bool rememberMe)
    {
        SymmetricSecurityKey key       = new(Encoding.UTF8.GetBytes(_secureKey));
        SigningCredentials credentials = new(key, SecurityAlgorithms.HmacSha256Signature);

        JwtHeader header   = new(credentials);
        JwtPayload payload = new(id.ToString(), null, null, null, DateTime.Today.AddDays(rememberMe ? 7 : 1));

        JwtSecurityToken token = new(header, payload);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public JwtSecurityToken Verify(string token)
    {
        JwtSecurityTokenHandler handler = new();
        
        byte[] key = Encoding.ASCII.GetBytes(_secureKey);

        handler.ValidateToken(token, new TokenValidationParameters
        {
            IssuerSigningKey         = new SymmetricSecurityKey(key),
            ValidateIssuerSigningKey = true,
            ValidateIssuer           = false,
            ValidateAudience         = false,
        }, 
            out SecurityToken validatedToken);

        return (JwtSecurityToken) validatedToken;
    }
}