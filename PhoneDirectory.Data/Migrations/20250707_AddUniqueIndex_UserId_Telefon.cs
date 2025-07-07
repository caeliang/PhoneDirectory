using Microsoft.EntityFrameworkCore.Migrations;

namespace PhoneDirectory.Data.Migrations
{
    public partial class AddUniqueIndex_UserId_Telefon : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Kisiler_UserId_Telefon",
                table: "Kisiler",
                columns: new[] { "UserId", "Telefon" },
                unique: true
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Kisiler_UserId_Telefon",
                table: "Kisiler"
            );
        }
    }
}
