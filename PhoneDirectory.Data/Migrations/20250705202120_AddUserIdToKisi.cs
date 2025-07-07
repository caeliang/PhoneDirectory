using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhoneDirectory.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToKisi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Önce mevcut kişi kayıtlarını silelim çünkü henüz kullanıcılarla ilişkilendirilmemişler
            migrationBuilder.Sql("DELETE FROM Kisiler");
            
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Kisiler",
                type: "nvarchar(450)",
                nullable: false);

            migrationBuilder.CreateIndex(
                name: "IX_Kisiler_UserId",
                table: "Kisiler",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Kisiler_AspNetUsers_UserId",
                table: "Kisiler",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Kisiler_AspNetUsers_UserId",
                table: "Kisiler");

            migrationBuilder.DropIndex(
                name: "IX_Kisiler_UserId",
                table: "Kisiler");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Kisiler");
        }
    }
}
