using System.Text;

namespace PhoneDirectory.API.Services
{
    public interface ILoggingService
    {
        Task LogAsync(string level, string message, string? exception = null);
        Task LogInfoAsync(string message);
        Task LogWarningAsync(string message);
        Task LogErrorAsync(string message, string? exception = null);
    }

    public class FileLoggingService : ILoggingService
    {
        private readonly string _logFilePath;
        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

        public FileLoggingService()
        {
            var logsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "..", "Logs");
            Directory.CreateDirectory(logsDirectory);
            _logFilePath = Path.Combine(logsDirectory, $"phone-directory-{DateTime.Now:yyyy-MM-dd}.txt");
        }

        public async Task LogAsync(string level, string message, string? exception = null)
        {
            await _semaphore.WaitAsync();
            try
            {
                var logEntry = new StringBuilder();
                logEntry.AppendLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [{level}] {message}");
                if (!string.IsNullOrEmpty(exception))
                {
                    logEntry.AppendLine($"Exception: {exception}");
                }
                logEntry.AppendLine("----------------------------------------");

                await File.AppendAllTextAsync(_logFilePath, logEntry.ToString());
            }
            finally
            {
                _semaphore.Release();
            }
        }

        public async Task LogInfoAsync(string message)
        {
            await LogAsync("INFO", message);
        }

        public async Task LogWarningAsync(string message)
        {
            await LogAsync("WARNING", message);
        }

        public async Task LogErrorAsync(string message, string? exception = null)
        {
            await LogAsync("ERROR", message, exception);
        }
    }
}
