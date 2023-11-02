import { CRAWLER_STATE } from './utils';
import { PlaywrightCrawler } from 'crawlee';
import { SearchOptionsTypes, crawlYoutubeSearch } from './search';
import { crawlYoutubeChannel } from './channel.js';
import { getChannelAboutPageUrl, getSearchUrl } from './utils';

// Crawls the youtube search page to scrape channel names and extracts
// information about each channel sequencially from channel's about page.

export type ParamTypes = {
  keywords: string[];
  minSubs: number;
  maxSubs: number;
  maxChannelsPerKeyword: number;
};

async function youtubeCrawler(params: ParamTypes) {
  const keywords = params.keywords;
  const minSubs = params.minSubs;
  const maxSubs = params.maxSubs;
  const maxChannelsPerKeyword = params.maxChannelsPerKeyword;

  const options: SearchOptionsTypes = {
    minSubs,
    maxSubs,
    maxChannelsPerKeyword,
  };

  const requestArr = keywords.map((keyword) => {
    return {
      url: getSearchUrl(keyword),
      label: 'search-url',
    };
  });

  const crawler = new PlaywrightCrawler({
    launchContext: {
      launchOptions: {
        headless: false,
      },
    },
    maxRequestsPerCrawl: 1000,
    requestHandlerTimeoutSecs: 300,

    async requestHandler({ request, page, enqueueLinks, log }) {
      log.info(`Processing ${request.url}...`);

      if (request.label === 'search-url') {
        const result = await crawlYoutubeSearch(page, options);

        const channelUrls = result.map((channel) =>
          getChannelAboutPageUrl(channel.href!)
        );

        await enqueueLinks({
          urls: channelUrls,
          label: 'channel-url',
        });

        if (process.send) {
          process.send({
            state: CRAWLER_STATE.SEARCH,
            data: result,
          });
        }
      } else if (request.label === 'channel-url') {
        const result = await crawlYoutubeChannel(page);

        if (process.send) {
          process.send({
            state: CRAWLER_STATE.CHANNEL,
            data: result,
          });
        }
      }
    },

    failedRequestHandler({ request, log }) {
      log.info(`Request ${request.url} failed too many times.`);
    },
  });

  await crawler.addRequests(requestArr);
  await crawler.run();

  // Send a completion message
  if (process.send) {
    process.send({
      state: CRAWLER_STATE.COMPLETED,
    });
  }

  // Exit the process after completion
  process.exit(0);
}

// Listen for messages from the parent process
process.on('message', youtubeCrawler);
