using System.Security.Cryptography;
using System.Text;

namespace CKDCalculator.Utils;

public static class Crypto
{
    public enum Algorithm
    {
        Sha256
    }

    public static string Hash(Algorithm algorithm, string data)
    {
        return algorithm switch
        {
            Algorithm.Sha256 => Sha256(data),
            _                => throw new InvalidOperationException()
        };
    }

    private static string Sha256(string data)
    {
        StringBuilder builder = new();

        using (SHA256 hash = SHA256.Create())            
        {
            Encoding enc  = Encoding.UTF8;
            byte[] result = hash.ComputeHash(enc.GetBytes(data));

            foreach (byte b in result)
                builder.Append(b.ToString("x2"));
        }

        return builder.ToString(); 
    }
}
