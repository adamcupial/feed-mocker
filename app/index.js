import path from 'path';

import yargs from 'yargs';

import { start as recordStart } from './record/index.js';
import { start as mockStart } from './mock/index.js';

// eslint-disable-next-line no-unused-expressions
yargs(process.argv.slice(2))
  .command('record <dir>', 'start the recording proxy', (yarg) => {
    yarg
      .positional('dir', {
        describe: 'directory to save to',
        type: 'string',
        coerce: (arg) => path.resolve(arg),
      })
      .option('p', {
        alias: 'port',
        default: 8080,
        type: 'number',
      });
  }, (argv) => {
    recordStart(argv.dir, argv.port);
  })
  .command('replay <dir> [options]', 'start the mock replay', (yarg) => {
    yarg
      .positional('dir', {
        describe: 'directory to play from',
        type: 'string',
        coerce: (arg) => path.resolve(arg),
      })
      .option('p', {
        alias: 'port',
        default: 8080,
        type: 'number',
      });
  }, (argv) => {
    mockStart(argv.dir, argv.port);
  })
  .demandCommand()
  .help()
  .wrap(72)
  .argv;
