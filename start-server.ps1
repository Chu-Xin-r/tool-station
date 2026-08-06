# 启动工具站后端服务（后台运行，日志写入 server.log）
$ErrorActionPreference = 'Stop'
$workDir = 'E:\web\tools\server'
Set-Location $workDir

# 如果端口 8002 已被占用，先结束旧进程
$existing = Get-NetTCPConnection -LocalPort 8002 -ErrorAction SilentlyContinue
if ($existing) {
    $existing | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}

Start-Process -FilePath 'node' -ArgumentList 'index.js' `
    -WorkingDirectory $workDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput "$workDir\server.log" `
    -RedirectStandardError "$workDir\server.err.log"

Start-Sleep -Seconds 3
$check = Get-NetTCPConnection -LocalPort 8002 -ErrorAction SilentlyContinue
if ($check) {
    Write-Output "STARTED OK, PID=$($check[0].OwningProcess)"
} else {
    Write-Output "FAILED TO START"
    if (Test-Path "$workDir\server.err.log") {
        Get-Content "$workDir\server.err.log" -Tail 20
    }
}
