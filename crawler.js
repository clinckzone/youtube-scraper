// @ts-check
const { PlaywrightCrawler } = require('crawlee');
const { crawlYoutubeSearch } = require('./search.js');
const { crawlYoutubeChannel } = require('./channel.js');
const { getChannelAboutPageUrl, getSearchUrl } = require('./utils.js');

const CRAWLER_STATE = {
	SEARCH: 'SEARCH',
	CHANNEL: 'CHANNEL',
	COMPLETED: 'COMPLETED',
};

/**
 * Crawls the youtube search page to scrape channel names and extracts
 * information about each channel sequencially from channel's about page.
 * @param {{keywords: string[], minSubs: number, maxSubs: number, maxChannelsPerKeyword}} message
 * @returns
 */
async function youtubeCrawler(message) {
	const keywords = message.keywords;
	const minSubs = message.minSubs;
	const maxSubs = message.maxSubs;
	const maxChannelsPerKeyword = message.maxChannelsPerKeyword;

	const options = {
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

				const channelUrls = result.map((channel) => getChannelAboutPageUrl(channel.href));

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
