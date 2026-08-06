# 查找服务器上的 XShell 安装位置和会话配置
$ErrorActionPreference = 'SilentlyContinue'
$dirs = @(
  'C:\Program Files\NetSarang',
  'C:\Program Files (x86)\NetSarang',
  'C:\Program Files\NetSarang Computer',
  'C:\Program Files (x86)\NetSarang Computer',
  "$env:USERPROFILE\AppData\Local\NetSarang",
  'C:\ProgramData\NetSarang'
)

Write-Output "=== 查找 Xshell.exe ==="
Get-ChildItem 'C:\Program Files','C:\Program Files (x86)',"$env:LOCALAPPDATA" -Filter 'Xshell.exe' -Recurse -Depth 5 -ErrorAction SilentlyContinue | ForEach-Object { Write-Output $_.FullName }

Write-Output "=== NetSarang 目录 ==="
foreach ($d in $dirs) {
  if (Test-Path $d) {
    Write-Output "EXISTS: $d"
    Get-ChildItem $d -Depth 2 -ErrorAction SilentlyContinue | ForEach-Object { Write-Output "  $($_.FullName)" }
  }
}

Write-Output "=== Xshell 会话文件 (.xsh) ==="
Get-ChildItem "$env:USERPROFILE\Documents\NetSarang Computer\7\Xshell\Sessions","$env:USERPROFILE\Documents\NetSarang\Xshell\Sessions",'C:\ProgramData\NetSarang\Xshell\Sessions' -Filter '*.xsh' -Recurse -ErrorAction SilentlyContinue | ForEach-Object { Write-Output $_.FullName }
