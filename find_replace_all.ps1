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
    [string]$newWord,

    [Parameter(Mandatory=$false)]
    [string]$path = "." # Default to current directory if not provided
)

# --- STEP 1: RENAME WORDS INSIDE FILES ---
Write-Host "Searching and replacing '$oldWord' with '$newWord' in files within '$path'..."
Get-ChildItem -Path $path -Recurse -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match $oldWord) {
        $content -replace $oldWord, $newWord | Set-Content $_.FullName
    }
}
# --- STEP 2: RENAME THE FILES ---
Write-Host "Renaming files containing '$oldWord' to '$newWord' within '$path'..."
Get-ChildItem -Path $path -Filter "*$oldWord*" -Recurse | Where-Object { !$_.PSIsContainer } | ForEach-Object {
    $newName = $_.Name -replace $oldWord, $newWord
    $newPath = Join-Path $_.DirectoryName $newName
    if (Test-Path $newPath) {
        Write-Warning "Skipping file rename: '$newPath' already exists."
    } else {
        Rename-Item -Path $_.FullName -NewName $newName
    }
}

# --- STEP 3: RENAME THE FOLDERS ---
Write-Host "Renaming folders containing '$oldWord' to '$newWord' within '$path'..."
Get-ChildItem -Path $path -Filter "*$oldWord*" -Recurse | Where-Object { $_.PSIsContainer } | ForEach-Object {
    $newName = $_.Name -replace $oldWord, $newWord
    $newPath = Join-Path $_.Parent.FullName $newName
    if (Test-Path $newPath) {
        Write-Warning "Skipping folder rename: '$newPath' already exists."
    } else {
        Rename-Item -Path $_.FullName -NewName $newName
    }
}