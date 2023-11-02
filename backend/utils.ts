// Utility crawler state
export enum CRAWLER_STATE {
	SEARCH,
	CHANNEL,
	COMPLETED,
}

// Default values
export const PORT = 3000;
export const MAX_SUBSCRIBERS = 100000000;
export const MIN_SUBSCRIBERS = 1000;
export const MAX_CHANNELS_PER_KEYWORD = 100;

// Returns the youtube search url for a particular keyword with filter set to 'channel'
export function getSearchUrl(keyword: string): string {
	const serachUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
		keyword
	)}&sp=EgIQAg%253D%253D`;
	return serachUrl;
}

// Returns the about page url for a particular youtube channel
export function getChannelAboutPageUrl(channelHandle: string): string {
	const aboutPageUrl = new URL(
		channelHandle + '/about',
		'https://www.youtube.com'
	);
	return aboutPageUrl.toString();
}

// Convert a string with commas and number (ex. 54,67,890) to a proper number
export function convertStringToNumber(views: string): number {
	const text = views.split(' ')[0];
	const num = Number(text.replace(/,/g, ''));
	return num;
}

// Extracts the urlString from string of form --yt-channel-banner: url(urlString);
export function getBannerUrl(str: string): string | undefined {
	const regex = /url\(([^)]+)\)/;
	const match = str.match(regex);

	if (match && match[1]) {
		const url = match[1];
		return url;
	} else {
		return undefined;
	}
}

// Extract the search keyword from the url
export function extractKeywordFromURL(urlString: string): string | null {
	const url = new URL(urlString);
	const params = new URLSearchParams(url.search);
	return params.get('search_query');
}

// Parse the number of subscribers from the string
export function parseSubscribers(subs: string): number {
	if (subs !== '') {
		const text = subs.split(' ')[0];
		let postfix = text[text.length - 1];
		let sub_int = Number(text.slice(0, -1));

		switch (postfix) {
			case 'M': {
				sub_int = sub_int * 1000000;
				break;
			}
			case 'K': {
				sub_int = sub_int * 1000;
				break;
			}
			default:
				sub_int = sub_int;
		}

		return sub_int;
	}
	return 0;
}
