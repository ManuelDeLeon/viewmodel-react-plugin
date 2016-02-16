git add .
git reset -- dist/*
npm run commit
set /p a="git push? (Y/n)"
IF "%a%"=="" (
  git push
)