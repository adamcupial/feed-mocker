import { Feed } from './feed.js';
import { logger } from '../utils.js';

export class FeedContainer {
  constructor (manifest, directory) {
    this.feeds = [];

    const entries = Object.entries(manifest);
    entries.sort((a, b) => {
      const aPattern = a.pattern ?? '';
      const bPattern = b.pattern ?? '';
      return bPattern.length - aPattern.length;
    });

    logger.debug(`Registering mocks, found ${entries.length}`);
    entries.forEach(([name, feedManifest]) => {
      const feed = new Feed(name, feedManifest, directory);
      logger.debug(feed.toString());
      this.feeds.push(feed);
    });
  }

  async getFeedResponseForUri (url) {
    let selectedFeed;

    for (let i = 0; i < this.feeds.length; i++) {
      if (this.feeds[i].useForUrl(url)) {
        selectedFeed = this.feeds[i];
        break;
      }
    }

    if (selectedFeed) {
      const response = await selectedFeed.getResponse();
      logger.info(`${url} => ${selectedFeed.name} (${response.statusCode})`);
      return response;
    } else {
      logger.info(`${url} => mockEmpty`);
      return {
        statusCode: 404,
        headers: [],
        body: '',
      };
    }
  }
}
