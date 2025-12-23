#!/bin/bash

cd core
NEW_CORE_VERSION=$(npm version patch)

cd ../elements
node --eval "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json')); pkg.dependencies['@zoompinch/core'] = process.argv[1].replace(/^v/, '^'); fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));" "$NEW_CORE_VERSION"
NEW_ELEMENTS_VERSION=$(npm version patch)

cd ../vue
node --eval "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json')); pkg.dependencies['@zoompinch/core'] = process.argv[1].replace(/^v/, '^'); fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));" "$NEW_CORE_VERSION"
NEW_VUE_VERSION=$(npm version patch)

cd ../react
node --eval "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json')); pkg.dependencies['@zoompinch/core'] = process.argv[1].replace(/^v/, '^'); fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));" "$NEW_CORE_VERSION"
NEW_REACT_VERSION=$(npm version patch)

cd ../playground
node --eval "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json')); pkg.dependencies['@zoompinch/vue'] = process.argv[1].replace(/^v/, '^'); fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));" "$NEW_VUE_VERSION"

