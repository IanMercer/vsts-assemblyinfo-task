Remove-Item *.vsix

npm run build

$assemblyInfoExtension = (Get-Item -Path ".\" -Verbose).FullName
tfx extension create --manifest-globs vss-extension.json --root $assemblyInfoExtension