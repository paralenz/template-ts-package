#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const fs = require('fs')
const { spawnSync } = require('child_process')

const devDepsToBeInstalled = [
  'jest',
  'ts-node',
  'typescript',
  '@types/jest',
  '@paralenz/eslint-config-typescript-react'
]

const replaceInFile = (filename, pkgName) => {
  const filePath = path.resolve(path.join(__dirname, '..', filename))
  const content = fs.readFileSync(filePath, 'utf8')
  return content.replace(/%name%/g, pkgName)
}

const writeFile = (toPath, content) => fs.writeFileSync(
  path.resolve(path.join(__dirname, '..', toPath)),
  content,
  { encoding: 'utf8' }
)

const main = () => {
  const [name] = process.argv.slice(2)

  if (!name) {
    console.error('Missing package name')
    process.exit(1)
  }

  writeFile('readme.md', replaceInFile('README.md', name))
  writeFile('package.json', replaceInFile('package.json', name))

  const { status } = spawnSync('yarn', ['add', '-D', ...devDepsToBeInstalled], {
    stdio: 'inherit'
  })
  if (status) {
    console.error('Failed to install dependencies')
    process.exit(status)
  }

  fs.rmSync(path.resolve(path.join(__dirname, '..', 'setup.js')))
}

main()
