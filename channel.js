// @ts-check

import { convertStringToNumber, parseSubscribers } from './utils.mjs';

export async function crawlYoutubeChannel(page) {
	await page.waitForLoadState('networkidle');

	// Setting the functions in the browser context
	await page.exposeFunction(parseSubscribers.name, parseSubscribers);
	await page.exposeFunction(convertStringToNumber.name, convertStringToNumber);

	const name = await page.$eval('yt-formatted-string[id="text"]', (el) => el.innerText);

	const handle = await page.$eval(
		'yt-formatted-string[id="channel-handle"]',
		(el) => el.innerText
	);

	const subscribers = await page.$eval('yt-formatted-string[id="subscriber-count"]', (el) =>
		parseSubscribers(el.innerText)
	);

	const channelPronouns = await page.$eval(
		'yt-formatted-string[id="channel-pronouns"]',
		(el) => el.innerText
	);

	const description = await page.$eval(
		'yt-formatted-string[id="description"]',
		(el) => el.innerHTML
	);

	const videoCount = await page.$eval('yt-formatted-string[id="videos-count"]', (el) =>
		parseSubscribers(el.innerText)
	);

	const location = await page.$eval(
		'#details-container > table > tbody > tr:nth-child(2) > td:nth-child(2) > yt-formatted-string',
		(el) => el.innerText
	);

	const joined = await page.$eval(
		'#right-column > yt-formatted-string:nth-child(2) > span:nth-child(2)',
		(el) => el.innerText
	);

	const views = await page.$eval('#right-column > yt-formatted-string:nth-child(3)', (el) =>
		convertStringToNumber(el.innerText)
	);

	const linksEntries = [];
	const linkElements = await page.$$(
		'#link-list-container > yt-channel-external-link-view-model'
	);

	// Iterate over the selected link items in linkElements
	for (let linkElem of linkElements) {
		const headerSelector = '.yt-channel-external-link-view-model-wiz__title';
		const urlSelector = '.yt-channel-external-link-view-model-wiz__link > a';

		const header = await linkElem.$eval(headerSelector, (el) => el.innerText);
		const url = await linkElem.$eval(urlSelector, (el) => el.innerText);

		linksEntries.push([header, url]);
	}

	// Create a link object from the linkEntries array
	const links = Object.fromEntries(linksEntries);

	const data = {
		name,
		handle,
		subscribers,
		channelPronouns,
		videoCount,
		description,
		location,
		joined,
		views,
		links,
	};

	return data;
}
