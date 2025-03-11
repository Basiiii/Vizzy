# Use the .NET 9 SDK to build the project
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy project files and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the app and build it
COPY . ./
RUN dotnet publish -c Release -o /out

# Use the .NET 9 runtime image for execution
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /out .

# Expose the API port
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Run the API
CMD ["dotnet", "Vizzy.Api.dll"]
