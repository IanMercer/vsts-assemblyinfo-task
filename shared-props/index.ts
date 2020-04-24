import tl = require('azure-pipelines-task-lib/task');
import chardet = require('chardet');
import fs = require('fs');
import iconv = require('iconv-lite');
import moment = require('moment');
import path = require('path');
import xml2js = require('xml2js');

import { LoggingLevel } from './enums';
import * as models from './models';
import { Logger } from './services';
import * as utils from './services/utils.service';

let logger: Logger = new Logger(false, LoggingLevel.Normal);

async function run() {

    try {
        const regExModel = new models.RegEx();

        const model = getDefaultModel();
        model.fileNames = utils.formatFileNames(model.fileNames);

        logger = new Logger(model.failOnWarning, utils.mapLogLevel(model.logLevel));

        // Make sure path to source code directory is available
        if (!tl.exist(model.path)) {
            logger.error(`Source directory does not exist: ${model.path}`);
            return;
        }

        applyTransforms(model, regExModel);
        printTaskParameters(model);
        setManifestData(model, regExModel);

        // set output variables
        tl.setVariable('AssemblyInfo.Version', model.packageVersion, false);
        tl.setVariable('AssemblyInfo.AssemblyVersion', model.assemblyVersion, false);
        tl.setVariable('AssemblyInfo.FileVersion', model.assemblyFileVersion, false);
        tl.setVariable('AssemblyInfo.InformationalVersion', model.assemblyInformationalVersion, false);

        logger.success('Complete.');

    } catch (err) {
        logger.error(`Task failed with error: ${err.message}`);
    }
}

function applyTransforms(model: models.AssemblyInfo, regex: models.RegEx): void {
    Object.keys(model).forEach((key: string) => {
        if (model.hasOwnProperty(key)) {
            const value = Reflect.get(model, key);
            if (typeof value === 'string' && value !== '') {
                const newValue = utils.transformDates(value, regex);
                if (value !== newValue) {
                    Reflect.set(model, key, newValue);
                    // logger.debug(`Key: ${key},  Value: ${value},  New Value: ${newValue}`);
                }
            }
          }
    });
}

function getDefaultModel(): models.AssemblyInfo {
    const model: models.AssemblyInfo = {
        path: tl.getPathInput('Path', true) || '',
        fileNames: tl.getDelimitedInput('FileNames', '\n', true),
        fileEncoding: tl.getInput('FileEncoding', true) || '',
        detectedFileEncoding: '',
        writeBOM: tl.getBoolInput('WriteBOM', true),

        releaseNotes: tl.getInput('PackageReleaseNotes', false) || '',

        packageVersion: tl.getInput('PackageVersion', false) || '',
        assemblyVersion : tl.getInput('AssemblyVersion', false) || '',
        assemblyFileVersion: tl.getInput('AssemblyFileVersion', false) || '',
        assemblyInformationalVersion: tl.getInput('AssemblyInformationalVersion', false) || '',
        verBuild: '',
        verRelease: '',

        logLevel: tl.getInput('LogLevel', true) || '',
        failOnWarning: tl.getBoolInput('FailOnWarning', true),
    };

    return model;
}

function printTaskParameters(model: models.AssemblyInfo): void {

    logger.debug('Task Parameters...');
    logger.debug(`Source folder: ${model.path}`);
    logger.debug(`Source files: ${model.fileNames}`);
    //logger.debug(`File encoding: ${model.fileEncoding}`);
    //logger.debug(`Write unicode BOM: ${model.writeBOM}`);

    logger.debug(`Release notes: ${model.releaseNotes}`);
    logger.debug(`Package version: ${model.packageVersion}`);
    logger.debug(`Assembly version: ${model.assemblyVersion}`);
    logger.debug(`Assembly file version: ${model.assemblyFileVersion}`);
    logger.debug(`Informational version: ${model.assemblyInformationalVersion}`);

    //logger.debug(`Log Level: ${model.logLevel}`);
    //logger.debug(`Fail on Warning: ${model.failOnWarning}`);

    logger.debug('');
}

function setManifestData(model: models.AssemblyInfo, regEx: models.RegEx): void {

    logger.info('Setting shared msbuild or props ...');
    logger.info('');

    tl.findMatch(model.path, model.fileNames).forEach((file: string) => {

        logger.info(`Processing: ${file}`);

        if (!tl.exist(file)) {
            logger.error(`File not found: ${file}`);
            return;
        }

        setFileEncoding(file, model);

        if (!iconv.encodingExists(model.detectedFileEncoding)) {
            logger.error(`${model.detectedFileEncoding} file encoding not supported`);
            return;
        }

        const fileContent: string = iconv.decode(fs.readFileSync(file), model.detectedFileEncoding);

        const parser = new xml2js.Parser();
        parser.parseString(fileContent, (err: any, result: any) => {

            if (err) {
                logger.error(`Error reading file: ${err}`);
                return;
            }

            if (!result.Project || !result.Project.PropertyGroup) {
                logger.error(`Error reading file: ${err}`);
                return;
            }

            for (const group of result.Project.PropertyGroup) {

                // Ensure we're in the correct property group containing a Version property
                if (!group.Version) {
                    continue;
                }

                setAssemblyData(group, model);
            }

            // rebuild xml project structure
            const builder = new xml2js.Builder({ headless: true });
            const xml = builder.buildObject(result);

            fs.writeFileSync(file, iconv.encode(xml, model.detectedFileEncoding, { addBOM: model.writeBOM, stripBOM: undefined, defaultEncoding: undefined }));

            const encodingResult = getFileEncoding(file);
            //logger.debug(`Verify file encoding: ${encodingResult}`);
            logger.info('');
        });
    });
}

function getFileEncoding(file: string): string {
    const encoding = chardet.detectFileSync(file, { sampleSize: 64 });
    return encoding && encoding.toString().toLocaleLowerCase() || 'utf-8';
}

function setFileEncoding(file: string, model: models.AssemblyInfo) {
    const encoding = getFileEncoding(file);
    //logger.debug(`Detected file encoding: ${encoding}`);

    model.detectedFileEncoding = model.fileEncoding;

    if (model.fileEncoding === 'auto') {
        model.detectedFileEncoding = encoding;
    } else if (model.fileEncoding !== encoding) {
        logger.warning(`Detected file encoding (${encoding}) is different to the one specified (${model.fileEncoding}).`);
    }
}

function setAssemblyData(group: any, model: models.AssemblyInfo): void {

    // Release Notes
    if (model.releaseNotes) {
        if (group.PackageReleaseNotes || group.PackageReleaseNotes === '') {
            group.PackageReleaseNotes = model.releaseNotes;
            logger.info(`PackageReleaseNotes --> ${model.releaseNotes}`);
        }
    }

    // Assembly Version
    if (model.assemblyVersion) {
        if (group.AssemblyVersion || group.AssemblyVersion === '') {
            logger.info(`AssemblyVersion ${group.AssemblyVersion} --> ${model.assemblyVersion}`);
            group.AssemblyVersion = model.assemblyVersion;
        }
    }

    // Package Version
    if (model.packageVersion) {
        if (group.Version || group.Version === '') {
            logger.info(`Version ${group.Version} --> ${model.packageVersion}`);
            group.Version = model.packageVersion;
        }
    }

    // File Version
    if (model.assemblyFileVersion) {
        if (group.AssemblyFileVersion || group.AssemblyFileVersion === '') {
            logger.info(`AssemblyFileVersion ${group.AssemblyFileVersion} --> ${model.assemblyFileVersion}`);
            group.AssemblyFileVersion = model.assemblyFileVersion;
        }
    }

    // Informational Version
    if (model.assemblyInformationalVersion) {
        if (group.InformationalVersion || group.InformationalVersion === '') {
            logger.info(`AssemblyInformationalVersion ${group.InformationalVersion} --> ${model.assemblyInformationalVersion}`);
            group.InformationalVersion = model.assemblyInformationalVersion;
        }
    }
}

run();
