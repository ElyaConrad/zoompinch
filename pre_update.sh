#!/bin/bash

cd core
NEW_CORE_VERSION=$(npm version patch)

cd ../elements
npm version patch

cd ../vue
npm version patch

cd ../