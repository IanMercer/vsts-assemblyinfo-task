export abstract class AssemblyInfo {
    path: string = '';
    fileNames: string[] = [];
    fileEncoding: string = '';
    detectedFileEncoding: string = '';
    writeBOM: boolean = false;

    packageVersion: string = '';
    assemblyVersion: string = '';
    assemblyFileVersion: string = '';
    assemblyInformationalVersion: string = '';
    verBuild: string = '';
    verRelease: string = '';

    releaseNotes: string = '';

    logLevel: string = '';
    failOnWarning: boolean = false;
}
