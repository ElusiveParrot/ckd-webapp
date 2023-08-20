namespace CKDCalculator.Utils;

public class UrlBuilder
{
    private readonly string _baseUrl;

    private readonly Dictionary<string, string> _parameters = new();

    public UrlBuilder(string baseUrl)
    {
        _baseUrl = baseUrl;
    }

    public void AddParameter(string name, string value) => _parameters.Add(name, value);

    public string Build()
    {
        string url = _baseUrl;
        
        if (url[url.Length - 1] != '/')
            url += '/';

        url += '?';

        foreach (KeyValuePair<string, string> parameter in _parameters)
            url += $"{parameter.Key.Replace(" ", "%20")}={parameter.Value.Replace(" ", "%20")}&";

        if (url[url.Length - 1] == '&')
            url = url.Remove(url.Length - 1, 1);

        return url;
    }
}