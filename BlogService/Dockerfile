# https://hub.docker.com/_/microsoft-dotnet

# POKRETANJE KONTEJNERA SA .NET APLIKACIJOM

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 as build
WORKDIR /src
COPY . .
WORKDIR /src/src
RUN dotnet restore BlogService/BlogService.csproj
RUN dotnet build BlogService/BlogService.csproj -c Release

FROM build as publish
RUN dotnet publish BlogService/BlogService.csproj -c Release -o /app/publish

ENV ASPNETCORE_URLS=http://+:80
FROM base AS final
COPY --from=publish /app .
WORKDIR /app/publish
CMD ["dotnet", "BlogService.dll"]

# STAGE ZA MIGRACIJU BAZE KOJU GAĐAMO KROZ MIGRATION-COMPOSE

# Following stages require to be run in network where database is running
# and currently BuildKit does not support running container during build
# in a custom network: https://github.com/moby/moby/issues/40379.
# Workaround is to build image and run the container from that image
# in desired network.

FROM build as migration-base
ENV PATH="$PATH:/root/.dotnet/tools"
RUN dotnet tool install --global dotnet-ef --version 8.*

FROM migration-base AS execute-migration

ENV DATABASE_HOST=database
ENV DATABASE_PORT=5432
ENV DATABASE_USERNAME=postgres
ENV DATABASE_PASSWORD=super
ENV DATABASE_SCHEMA=public
ENV MIGRATION=InitialCreate

CMD PATH="$PATH:/root/.dotnet/tools" \
    dotnet-ef database update "${MIGRATION}" \
        -s "BlogService/BlogService.csproj" \
        -p "BlogService/BlogService.csproj" \
        -c "BlogContext" \
        --configuration Release
