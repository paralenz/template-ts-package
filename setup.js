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

const readFile = filename => {
  const filePath = path.resolve(path.join(__dirname, filename))
  return fs.readFileSync(filePath, 'utf8')
}

const writeFile = (toPath, content) => fs.writeFileSync(
  path.resolve(path.join(__dirname, toPath)),
  content,
  { encoding: 'utf8' }
)

const replaceInFile = (filename, pkgName) => {
  return readFile(filename).replace(/%name%/g, pkgName)
}

const renameFile = (from, to) => {
  const fromPath = path.resolve(path.join(__dirname, from))
  const toPath = path.resolve(path.join(__dirname, to))

  return fs.renameSync(fromPath, toPath)
}

const main = () => {
  const [name] = process.argv.slice(2)

  if (!name) {
    console.error('Missing package name')
    process.exit(1)
  }

  writeFile('_readme.tmpl', replaceInFile('README.md', name))
  writeFile('package.json', replaceInFile('package.json', name))

  const { status } = spawnSync('yarn', ['add', '-D', ...devDepsToBeInstalled], {
    stdio: 'inherit'
  })
  if (status) {
    console.error('Failed to install dependencies')
    process.exit(status)
  }

  renameFile('.github/workflows/publish.tmpl', '.github/workflows/publish.yml')
  renameFile('.github/workflows/pull-request.tmpl', '.github/workflows/pull-request.yml')
  renameFile('.github/dependabot.tmpl', '.github/dependabot.yml')
  fs.rmSync(path.resolve(path.join(__dirname, 'setup.js')))
  spawnSync('rm', ['-rf', '.git'])
  spawnSync('git', ['init'])
}

main()
