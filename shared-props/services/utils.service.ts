import { LoggingLevel } from '../enums';
import * as sharedModels from '../models';

export function setWildcardVersionNumber(value: string, verBuild: string, verRelease: string) {

    if (!value || value === '') {
        return value;
    }

    if (value.includes('.*.*')) {
        value = value.replace('.*.*', `.${verBuild}.${verRelease}`);
    } else if (value.includes('.*')) {
        value = value.replace('.*', `.${verBuild}`);
    }

    return value;
}

export function formatFileNames(fileNames: string[]): string[] {
    const targetFiles: string[] = [];
    fileNames.forEach((x: string) => {
        if (x) {
            x.split(',').forEach((y: string) => {
                if (y) {
                    targetFiles.push(y.trim());
                }
            });
        }
    });
    return targetFiles;
}

export function mapLogLevel(level: string): LoggingLevel {
    switch (level) {
        case 'normal':
            return LoggingLevel.Normal;

        case 'verbose':
            return LoggingLevel.Verbose;

        case 'off':
            return LoggingLevel.Off;
    }

    return LoggingLevel.Normal;
}
