@ECHO OFF
git add .
git reset -- dist/*
npm run commit:push