# Build aşaması
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Proje dosyalarını kopyala ve restore et
COPY . ./
RUN dotnet restore

# Projeyi publish et
RUN dotnet publish -c Release -o out

# Runtime aşaması
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out ./

# Uygulamayı başlat
ENTRYPOINT ["dotnet", "PhoneDirectory.API.dll"]