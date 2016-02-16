@ECHO OFF
git add .
git reset -- dist/*
CALL npm run commit
set /p a="git push? (Y/n)"
IF "%a%"=="" (
  git push
)