#!/bin/bash

cd core
npm version patch

cd ../elements
npm version patch

cd ../vue
npm version patch

cd ../