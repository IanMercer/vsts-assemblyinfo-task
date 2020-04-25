|      | Build | Release | Version | Downloads | Rating |
|------|-------|---------|---------|-----------|--------|
| Live | ![build](https://signswift.visualstudio.com/TS%20Extensions/_apis/build/status/GitHub-Assembly-Info-Live.Published) | ![release](https://signswift.vsrm.visualstudio.com/_apis/public/Release/badge/86c93e13-9469-4df8-95f0-98c43c760a09/1/2) | ![version](https://img.shields.io/badge/version-2.1.92-blue.svg?logo=tfs) | ![downloads](https://img.shields.io/badge/downloads-7.9k-brightgreen.svg?logo=tfs) | ![rating](https://img.shields.io/badge/rating-4.4/5_(25)-brightgreen.svg?logo=tfs) |
| Test | ![build](https://signswift.visualstudio.com/TS%20Extensions/_apis/build/status/GitHub-Assembly-Info-Test.Published) | ![release](https://signswift.vsrm.visualstudio.com/_apis/public/Release/badge/86c93e13-9469-4df8-95f0-98c43c760a09/1/1) | ![version](https://img.shields.io/badge/version-2.1.95-blue.svg?logo=tfs) |     |     |

# Shared Props Updater
Shared Props Updater is an extension for Azure DevOps that populates version information into a shared.msbuild or shared.props file in a dotnetcore solution. These shared property files can be included in projects automatically or explicitly using a line like:

    <Import Project="$(MSBuildThisFileDirectory)..\Shared.msbuild" />

... placed after all the other properties have been set in each CSPROJ file.

This approach is preferable to using AssemblyInfo.cs or GlobalAssemblyInfo.cs or updating properties in csproj files because it puts all the metadata in one location. You can set your company name, author, product and trademark data in one place, and now you can also have an automatically updated versions.

# Based on
This extension for Azure DevOps is based on an original concept by [Bleddyn Richards](https://github.com/BMuuN/vsts-assemblyinfo-task) but now updated only shared msbuild and props files and eliminates all of the properties that
can already be set manually, once in a shared msbuild/props file. It also eliminates any code to do with calculating a version number as I believe that should be a separate task: some people will use the build date, others will use gitversion to get a version number.

## Details
For information relating to the extension please see the [overview](./src/Overview.md).  

The Visual Studio Marketplace listing can be found here:  
[https://marketplace.visualstudio.com/items?itemName=signswift.Assembly-Info-Task](https://marketplace.visualstudio.com/items?itemName=signswift.Shared-Props-Task)

# Help and Support
For help or support please contact me through [Github](https://github.com/IanMercer/vsts-assemblyinfo-task).
