import fs from 'fs';
import path from 'path';
import { logger } from '../utils.js';

export class Manifest {
  constructor (dir) {
    this.dir = dir;
    this.records = [];
    this.manifestPath = path.join(dir, 'manifest.json');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    logger.debug(`Manifest ${dir} started`);
  }

  toJSON () {
    return {
      example_whatever: {
        events: this.records.map((record) => ({
          file: path.relative(this.dir, record.file),
          statusCode: record.statusCode,
          headers: record.headers,
        })),
      },
    };
  }

  addRecord (record) {
    let ft = 'txt';

    if (record.headers['content-type'].indexOf('xml') !== -1) {
      ft = 'xml';
    } else if (record.headers['content-type'].indexOf('json') !== -1) {
      ft = 'json';
    }

    const filePath = path.join(this.dir, `${record.id}.${ft}`);
    record.file = filePath;
    this.records.push(record);

    fs.writeFile(filePath, record.body, (err) => {
      if (err) {
        logger.error(err);
      } else {
        logger.debug(`${filePath} saved`);
      }
    });
    fs.writeFile(this.manifestPath, JSON.stringify(this), (err) => {
      if (err) {
        logger.error(err);
      } else {
        logger.debug(`${this.manifestPath} saved`);
      }
    });
  }
}
