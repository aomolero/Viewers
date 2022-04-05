#!/usr/bin/env node

import program from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import QUESTIONS from './questions.js';
import {
  createExtension,
  createMode,
  addExtension,
  removeExtension,
  addMode,
  removeMode,
  listPlugins,
  searchPlugins,
  linkExtension,
  linkMode,
  unlinkExtension,
  unlinkMode,
} from './commands/index.js';
import chalk from 'chalk';

const runningDirectory = process.cwd();
const viewerDirectory = path.resolve(runningDirectory, 'platform/viewer');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(runningDirectory, 'package.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.name !== 'ohif-root') {
    console.log(packageJson);
    console.log(
      chalk.red('ohif-cli must run from the root of the OHIF platform')
    );
    process.exit(1);
  }
} catch (error) {
  console.log(
    chalk.red('ohif-cli must run from the root of the OHIF platform')
  );
  process.exit(1);
}

// Todo: inject with webpack
program.version('2.0.7').description('OHIF CLI');

program
  .command('create-extension')
  .description('Create a new template extension')
  .action(() => {
    inquirer.prompt(QUESTIONS.createExtension).then(answers => {
      const templateDir = path.join(__dirname, '../templates/extension');

      answers.templateDir = templateDir;
      answers.targetDir = path.join(answers.baseDir, answers.name);

      createExtension(answers);
    });
  });

program
  .command('create-mode')
  .description('Create a new template Mode')
  .action(name => {
    inquirer.prompt(QUESTIONS.createMode).then(answers => {
      const templateDir = path.join(__dirname, '../templates/mode');

      answers.templateDir = templateDir;
      answers.targetDir = path.join(answers.baseDir, answers.name);

      createMode(answers);
    });
  });

program
  .command('add-extension <packageName> [version]')
  .description('Adds an ohif extension')
  .action((packageName, version) => {
    // change directory to viewer
    process.chdir(viewerDirectory);
    addExtension(packageName, version);
  });

program
  .command('remove-extension <packageName>')
  .description('removes an ohif extension')
  .action(packageName => {
    // change directory to viewer
    process.chdir(viewerDirectory);
    removeExtension(packageName);
  });

program
  .command('add-mode <packageName> [version]')
  .description('Removes an ohif mode')
  .action((packageName, version) => {
    // change directory to viewer
    process.chdir(viewerDirectory);
    addMode(packageName, version);
  });

program
  .command('remove-mode <packageName>')
  .description('Removes an ohif mode')
  .action(packageName => {
    // change directory to viewer
    process.chdir(viewerDirectory);
    removeMode(packageName);
  });

program
  .command('link-extension <packageDir>')
  .description(
    'Links a local OHIF extension to the Viewer to be used for development'
  )
  .action(packageDir => {
    if (!fs.existsSync(packageDir)) {
      console.log(
        chalk.red(
          'The extension directory does not exist, please provide a valid directory'
        )
      );
      process.exit(1);
    }
    linkExtension(packageDir, { viewerDirectory });
  });

program
  .command('unlink-extension <extensionName>')
  .description('Unlinks a local OHIF extension from the Viewer')
  .action(extensionName => {
    unlinkExtension(extensionName, { viewerDirectory });
  });

program
  .command('link-mode <packageDir>')
  .description(
    'Links a local OHIF mode to the Viewer to be used for development'
  )
  .action(packageDir => {
    if (!fs.existsSync(packageDir)) {
      console.log(
        chalk.red(
          'The mode directory does not exist, please provide a valid directory'
        )
      );
      process.exit(1);
    }
    linkMode(packageDir, { viewerDirectory });
  });

program
  .command('unlink-mode <extensionName>')
  .description('Unlinks a local OHIF mode from the Viewer')
  .action(modeName => {
    unlinkMode(modeName, { viewerDirectory });
  });

program
  .command('list')
  .description('List Added Extensions and Modes')
  .action(() => {
    const configPath = path.resolve(viewerDirectory, './pluginConfig.json');
    listPlugins(configPath);
  });

program
  .command('search')
  .option('-v, --verbose', 'Verbose output')
  .description('Search NPM for the list of Modes and Extensions')
  .action(options => {
    searchPlugins(options);
  });

program.parse(process.argv);