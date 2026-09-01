@echo off
chcp 65001 > nul
set ANTHROPIC_BASE_URL=https://seekai.cc
set ANTHROPIC_API_KEY=sk-OvgVwHOJ3ihfyxn3ZTe5LS82v0SyW0ebmvbizFlXH7GeEhfy
set ANTHROPIC_MODEL=claude-opus-4-8

if "%~1"=="" (
    echo [Claude Opus 4.8] جاري تشغيل أداة Claude Code...
    claude.cmd
) else (
    node "%~dp0scripts\claude_opus.cjs" %*
)
