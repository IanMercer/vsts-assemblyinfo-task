# Shared Props Updater
Shared Props Updater is an extension for Azure DevOps that populates version information into shared msbuild or props files.

## How to use the build task
1. Create or edit a build definition.
2. Click **Add build step...** and add the **Shared Props Updater** task from the Build category.  
3. Move the **Shared Props Updater** task to the desired position ensuring it precedes the build task.  
4. Configure the task

## Considerations
- The task will only update files listed in the **Source Files** field.
- If no value is specified for a field that field will be ignored and the default value in the source file will be used.
- The task only updates properties that already exist, it does not attempt to guess which PropertyGroup to insert a new attribute into.

## Help and Support
For detailed instructions on how to configure the extension please see [Github](https://github.com/ianmercer/vsts-assemblyinfo-task/wiki).
