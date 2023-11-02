import { Page } from 'playwright';
import { parseSubscribers } from './utils';
import { ParamTypes } from './crawler';

// Crawls the youtube search page for a specific keyword and scrapes out
// all the available list of channels as per the provided options

export type SearchOptionsTypes = Omit<ParamTypes, 'keywords'>;

export async function crawlYoutubeSearch(
  page: Page,
  options: SearchOptionsTypes
) {
  await page.waitForLoadState('networkidle');

  // Setting the functions in the browser context
  await page.exposeFunction(parseSubscribers.name, parseSubscribers);

  let data = [];
  while (data.length <= options.maxChannelsPerKeyword) {
    const scrapedData = [];

    const noResults = await page.$(
      'ytd-item-section-renderer yt-formatted-string[id="message"]'
    );
    if (noResults) break;

    const channelElements = await page.$$(
      'ytd-item-section-renderer ytd-channel-renderer'
    );
    for (const channelElement of channelElements) {
      const channelData = await page.evaluate(async ($channel) => {
        const name = $channel.querySelector(
          'yt-formatted-string[id="text"]'
        )?.textContent;
        const href = $channel
          .querySelector('a[id="main-link"]')
          ?.getAttribute('href');

        let subscribers = 0;
        const subSourceA = $channel.querySelector(
          'span[id="video-count"]'
        )?.textContent;
        const subSourceB = $channel.querySelector(
          'span[id="subscribers"]'
        )?.textContent;

        if (subSourceA?.split(' ')[1] === 'subscribers')
          subscribers = await parseSubscribers(subSourceA);
        else if (subSourceB?.split(' ')[1] === 'subscribers')
          subscribers = await parseSubscribers(subSourceB);

        return { name, href, subscribers };
      }, channelElement);

      if (
        channelData.subscribers >= options.minSubs &&
        channelData.subscribers <= options.maxSubs
      ) {
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

  // Splice the data to make its length equal to maxChannelsPerKeyword
  const splicedData =
    data.length > options.maxChannelsPerKeyword
      ? data.splice(0, options.maxChannelsPerKeyword)
      : data;

  return splicedData;
}
