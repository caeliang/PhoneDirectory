using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhoneDirectory.Data.Migrations
{
    /// <inheritdoc />
    public partial class ExtendKisiForContactModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Kisiler",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Company",
                table: "Kisiler",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Kisiler",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsFavori",
                table: "Kisiler",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Kisiler",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Kisiler",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Kisiler");

            migrationBuilder.DropColumn(
                name: "Company",
                table: "Kisiler");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Kisiler");

            migrationBuilder.DropColumn(
                name: "IsFavori",
                table: "Kisiler");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Kisiler");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Kisiler");
        }
    }
}
