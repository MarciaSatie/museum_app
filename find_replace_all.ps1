<#
.SYNOPSIS
    Deep-cleans a project by replacing a specific word in folder names, filenames, and file content.

.DESCRIPTION
    This script performs a recursive search-and-replace starting from the folder where the script is executed.
    It targets:
    1. Text content inside all files.
    2. Filenames.
    3. Folder names.

.PARAMETER oldWord
    The existing word or phrase you want to remove.

.PARAMETER newWord
    The new word or phrase you want to insert.

.EXAMPLE
    .\find_replace_all.ps1 "OldProject" "NewProject"
    Replaces all instances of 'OldProject' with 'NewProject' in the current directory and all subdirectories.

.NOTES
    IMPORTANT: Always back up your project before running a global rename script.
#>

param (
    [Parameter(Mandatory=$true)]
    [string]$oldWord,

    [Parameter(Mandatory=$true)]
    [string]$newWord
)

# --- STEP 1: RENAME WORDS INSIDE FILES ---
Get-ChildItem -Path "." -Recurse -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match $oldWord) {
        $content -replace $oldWord, $newWord | Set-Content $_.FullName
    }
}
# --- STEP 2: RENAME THE FILES ---
Get-ChildItem -Path "." -Filter "*$oldWord*" -Recurse | Where-Object { !$_.PSIsContainer } | Rename-Item -NewName { $_.Name -replace $oldWord, $newWord }

# --- STEP 3: RENAME THE FOLDERS ---
Get-ChildItem -Path "." -Filter "*$oldWord*" -Recurse | Where-Object { $_.PSIsContainer } | Rename-Item -NewName { $_.Name -replace $oldWord, $newWord }
