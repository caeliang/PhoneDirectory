namespace PhoneDirectory.API.DTOs
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty; // Identity string ID kullanır
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
