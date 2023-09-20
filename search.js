// @ts-check

import { MIN_SUBSCRIBER_COUNT } from './const.mjs';
import { parseSubscribers } from './utils.mjs';

export async function crawlYoutubeSearch(page, enqueueLinks) {
	await page.waitForLoadState('networkidle');

	// Setting the functions in the browser context
	await page.exposeFunction(parseSubscribers.name, parseSubscribers);

	let data = [];
	while (true) {
		const scrapedData = [];

		const noResults = await page.$(
			'ytd-item-section-renderer yt-formatted-string[id="message"]'
		);
		if (noResults) break;

		const channelElements = await page.$$('ytd-item-section-renderer ytd-channel-renderer');
		for (const channelElement of channelElements) {
			const channelData = await page.evaluate(async ($channel) => {
				const name = $channel.querySelector('yt-formatted-string[id="text"]')?.textContent;
				const href = $channel.querySelector('span[id="subscribers"]')?.textContent;
				const subs = $channel.querySelector('span[id="video-count"]')?.textContent;

				// Since parseSubscribers returns a promise in the browser context, use await
				let subscribers = await parseSubscribers(subs);

				return { name, href, subscribers };
			}, channelElement);

			// Log channel data to console
			console.log(channelData);

			if (channelData.subscribers > MIN_SUBSCRIBER_COUNT) {
				scrapedData.push(channelData);
			}
		}

		// Remove the channels from DOM that have been scraped
		await page.evaluate(() => {
			const node = document.querySelector('ytd-item-section-renderer');
			if (node) node.remove();
		});

		// Wait for youtube to fetch new channels
		await page.waitForTimeout(1500);
		await page.waitForLoadState('networkidle');

		// Remove the spinner from DOM after fetching the new channels
		await page.evaluate(() => {
			const node = document.querySelector('ytd-continuation-item-renderer');
			if (node) node.remove();
		});

		data.push(...scrapedData);
	}

	return data;
}
