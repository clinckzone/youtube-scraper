// @ts-check

import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { crawlYoutubeSearch } from './search.js';
import { crawlYoutubeChannel } from './channel.js';
import { Dataset, PlaywrightCrawler } from 'crawlee';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all the search urls from the specified file
const file = process.argv[2];
const filePath = join(__dirname, file);
const fileContent = await fs.readFile(filePath, 'utf-8');
const requestArr = JSON.parse(fileContent).map((keyword) => {
	return {
		url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
			keyword
		)}&sp=EgIQAg%253D%253D`,
		label: 'search-url',
	};
});

const crawler = new PlaywrightCrawler({
	launchContext: {
		launchOptions: {
			headless: true,
		},
	},

	maxRequestsPerCrawl: 1000,
	requestHandlerTimeoutSecs: 300,

	async requestHandler({ request, page, enqueueLinks, log }) {
		log.info(`Processing ${request.url}...`);

		if (request.label === 'search-url') {
			const channels = await crawlYoutubeSearch(page, enqueueLinks);
			const channelLinks = channels.map(
				(channel) => `https://www.youtube.com/${channel.href}/about`
			);

			// Enqueue links for scraping channel data
			await enqueueLinks({
				urls: channelLinks,
				label: 'channel-url',
			});
		} else if (request.label === 'channel-url') {
			const channel = await crawlYoutubeChannel(page);

			// Log channel data
			console.log(channel);

			// Push channel data to Dataset
			await Dataset.pushData(channel);
		}
	},

	failedRequestHandler({ request, log }) {
		log.info(`Request ${request.url} failed too many times.`);
	},
});

await crawler.addRequests(requestArr);
await crawler.run();

console.log('Crawler finished.');
