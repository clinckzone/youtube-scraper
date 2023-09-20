// @ts-check

// Convert a string with commas and number (54,67,890) to a proper number
export function convertStringToNumber(views) {
	const text = views.split(' ')[0];
	const num = Number(text.replace(/,/g, ''));
	return num;
}

// Extract the search keyword from the url
export function extractKeywordFromURL(urlString) {
	const url = new URL(urlString);
	const params = new URLSearchParams(url.search);
	return params.get('search_query');
}

// Parse the number of subscribers from the string
export function parseSubscribers(subs) {
	if (subs !== '') {
		const text = subs.split(' ')[0];
		let postfix = text[text.length - 1];
		let sub_int = text.slice(0, -1);

		switch (postfix) {
			case 'M': {
				sub_int = parseInt(sub_int) * 1000000;
				break;
			}
			case 'K': {
				sub_int = parseInt(sub_int) * 1000;
				break;
			}
			default:
				sub_int = parseInt(sub_int);
		}

		return sub_int;
	}
}
