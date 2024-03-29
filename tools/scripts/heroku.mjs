import { readCachedProjectGraph } from '@nrwl/devkit'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, relative, join } from 'path'
import * as semver from 'semver'

import chalk from 'chalk'

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message))
    process.exit(1)
  }
}

function readJson(fileName) {
  try {
    const json = JSON.parse(readFileSync(fileName).toString())
    return json
  } catch (e) {
    console.error(
      chalk.bold.red(
        `Error reading package.json file from library build output.`
      )
    )
  }
}

// get main project
const [, , name] = process.argv

const graph = readCachedProjectGraph()
const project = graph.nodes[name]

// main project output path

invariant(
  project,
  `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
)

const _outputPath = project.data?.targets?.build?.options?.outputPath
invariant(
  _outputPath,
  `Could not find "build.options.outputPath" of project "${name}". Is project.json configured  correctly?`
)

const outputPath = resolve(_outputPath)
const herokuPath = resolve(outputPath, '..')
const relativePath = relative(herokuPath, outputPath)
const version = semver.default.major(process.versions.node)

// read package.json
const targetPackage = readJson(resolve(outputPath, 'package.json'))
const main = join('./', relativePath, targetPackage.main)

// merge my package.json
targetPackage.engines = {
  node: `>=${version}`,
}

// add start script
targetPackage.main = main
targetPackage.scripts.start = `NODE_ENV='production' node ${main}`

// write package.json
writeFileSync(
  resolve(herokuPath, `package.json`),
  JSON.stringify(targetPackage, null, 2)
)
