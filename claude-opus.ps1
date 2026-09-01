param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string]$Prompt
)

$env:ANTHROPIC_BASE_URL = "https://seekai.cc"
$env:ANTHROPIC_API_KEY = "sk-OvgVwHOJ3ihfyxn3ZTe5LS82v0SyW0ebmvbizFlXH7GeEhfy"
$env:ANTHROPIC_MODEL = "claude-opus-4-8"

if ([string]::IsNullOrWhiteSpace($Prompt)) {
    Write-Host "[Claude Opus 4.8] تشغيل Claude Code التفاعلي عبر SeekAI..." -ForegroundColor Cyan
    claude.cmd
} else {
    node "$PSScriptRoot\scripts\claude_opus.cjs" $Prompt
}
