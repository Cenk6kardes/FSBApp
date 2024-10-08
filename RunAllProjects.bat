@ECHO off

CHOICE /C dqp /T 3 /D D /M "Select an environment (d: Development(default), q: Qa, p: Production) "
IF ERRORLEVEL 1 SET ENV=Development
IF ERRORLEVEL 2 SET ENV=Qa
IF ERRORLEVEL 3 SET ENV=Production
ECHO Selected %ENV%

START /d "..\FSBWebApi" dotnet clean FSBWebApi.sln" &&
START /d "..\FSBWebApi" dotnet build FSBWebApi.sln" &&
START /d "..\FSBWebApi\FSBApiGateway" dotnet run FSBApiGateway --environment "%ENV%"
start /d "..\FSBWebApi\Catalogs\Catalogs.Controllers" dotnet run Catalogs.Controllers --environment "%ENV%"
start /d "..\FSBWebApi\Client\Client.Controllers" dotnet run Client.Controllers --environment "%ENV%"
start /d "..\FSBWebApi\LibraryModule\LibraryModule.Controllers" dotnet run LibraryModule.Controllers --environment "%ENV%"
start /d "..\FSBWebApi\Users\User.Controllers" dotnet run User.Controllers --environment "%ENV%"
start /d "..\FSBWebApi\DashBoard\DashBoard.Controllers" dotnet run DashBoard.Controllers --environment "%ENV%"
start /d "..\FSBWebApi\Activity\Activity.Controllers" dotnet run Activity.Controllers --environment "%ENV%"
start /d "..\FSBWebApi\NotificationWidget\NotificationWidget.Controllers" dotnet run NotificationWidget.Controllers --environment "%ENV%"
start /d "..\FSBWebApi\StartApp\StartApp.Controllers" dotnet run StartApp.Controllers --environment "%ENV%"
