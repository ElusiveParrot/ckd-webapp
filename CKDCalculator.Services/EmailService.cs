using Azure.Communication.Email;
using Azure.Communication.Email.Models;

namespace CKDCalculator.Services;

public class EmailService
{
    private readonly EmailServiceSettings _settings;

    private readonly EmailClient _client;

    public EmailService(EmailServiceSettings? settings)
    {
        _settings = settings ?? throw new ArgumentException("Email service settings are empty, edit appsettings.json");
        _client   = new EmailClient(_settings.ConnectionString);
    }

    public string Send(string receiver, string subject, string body)
    {
        EmailContent emailContent = new(subject)
        {
            PlainText = body
        };
        
        EmailRecipients emailRecipients = new(new [] { new EmailAddress(receiver) });
        EmailMessage emailMessage       = new(_settings.Address, emailContent, emailRecipients);
        
        SendEmailResult emailResult = _client.Send(emailMessage,CancellationToken.None);

        return emailResult.ToString() ?? "no error";
    }

    public class EmailServiceSettings
    {
        public string Address { get; set; }
        
        public string ConnectionString { get; set; }
    }
}