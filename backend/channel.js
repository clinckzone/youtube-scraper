// @ts-check
const { convertStringToNumber, parseSubscribers, getBannerUrl } = require('./utils.js');

/**
 * Crawls the about page of a specific youtube channel to
 * scrape all kinds of data publicly available data
 * @param {import('playwright').Page} page
 * @returns {Promise}
 */
async function crawlYoutubeChannel(page) {
	await page.waitForLoadState('networkidle');

	// Setting the functions in the browser context
	await page.exposeFunction(parseSubscribers.name, parseSubscribers);
	await page.exposeFunction(convertStringToNumber.name, convertStringToNumber);
	await page.exposeFunction(getBannerUrl.name, getBannerUrl);

	// @ts-ignore
	const name = await page.$eval('yt-formatted-string[id="text"]', (el) => el.innerText);

	const thumbnailUrl = await page.$eval('#img', (el) => el.getAttribute('src'));

	const bannerUrl = await page.$eval('#header > ytd-c4-tabbed-header-renderer', (el) => {
		const str = el.getAttribute('style');
		if (str) return getBannerUrl(str);
		return undefined;
	});

	const handle = await page.$eval(
		'yt-formatted-string[id="channel-handle"]',
		// @ts-ignore
		(el) => el.innerText
	);

	const subscribers = await page.$eval('yt-formatted-string[id="subscriber-count"]', (el) =>
		// @ts-ignore
		parseSubscribers(el.innerText)
	);

	const channelPronouns = await page.$eval(
		'yt-formatted-string[id="channel-pronouns"]',
		// @ts-ignore
		(el) => el.innerText
	);

	const description = await page.$eval(
		'yt-formatted-string[id="description"]',
		(el) => el.innerHTML
	);

	const videoCount = await page.$eval('yt-formatted-string[id="videos-count"]', (el) =>
		// @ts-ignore
		parseSubscribers(el.innerText)
	);

	const location = await page.$eval(
		'#details-container > table > tbody > tr:nth-child(2) > td:nth-child(2) > yt-formatted-string',
		// @ts-ignore
		(el) => el.innerText
	);

	const joined = await page.$eval(
		'#right-column > yt-formatted-string:nth-child(2) > span:nth-child(2)',
		// @ts-ignore
		(el) => el.innerText
	);

	const views = await page.$eval('#right-column > yt-formatted-string:nth-child(3)', (el) =>
		// @ts-ignore
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

		// @ts-ignore
		const header = await linkElem.$eval(headerSelector, (el) => el.innerText);

		// @ts-ignore
		const url = await linkElem.$eval(urlSelector, (el) => el.innerText);

		linksEntries.push([header, url]);
	}

	// Create a link object from the linkEntries array
	const links = Object.fromEntries(linksEntries);

	const data = {
		name,
		thumbnailUrl,
		bannerUrl,
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

module.exports = { crawlYoutubeChannel };
