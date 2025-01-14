rm -rf deploy
mkdir deploy

for file in $(find dist -name *.js); do
  base=$(basename "$file" .js)

  echo "Building deployment package for:" ${base}

  mkdir -p temp
  cp ${file} temp/index.js

  zip -rj "deploy/${base}.zip" temp/*

  rm -rf temp
done