import {
  getBannerUrl,
  parseSubscribers,
  convertStringToNumber,
} from './utils.js';
import { Page } from 'playwright';

// Crawls the about page of a specific youtube channel to
// scrape all kinds of data publicly available data

export async function crawlYoutubeChannel(page: Page) {
  await page.waitForLoadState('networkidle');

  // Setting the functions in the browser context
  await page.exposeFunction(parseSubscribers.name, parseSubscribers);
  await page.exposeFunction(convertStringToNumber.name, convertStringToNumber);
  await page.exposeFunction(getBannerUrl.name, getBannerUrl);

  const name = await page.$eval(
    'yt-formatted-string[id="text"]',
    (el) => (el as HTMLElement).innerText
  );

  const thumbnailUrl = await page.$eval('#img', (el) => el.getAttribute('src'));

  const bannerUrl = await page.$eval(
    '#header > ytd-c4-tabbed-header-renderer',
    (el) => {
      const str = el.getAttribute('style');
      if (str) return getBannerUrl(str);
      return undefined;
    }
  );

  const handle = await page.$eval(
    'yt-formatted-string[id="channel-handle"]',
    (el) => (el as HTMLElement).innerText
  );

  const subscribers = await page.$eval(
    'yt-formatted-string[id="subscriber-count"]',
    (el) => parseSubscribers((el as HTMLElement).innerText)
  );

  const channelPronouns = await page.$eval(
    'yt-formatted-string[id="channel-pronouns"]',
    (el) => (el as HTMLElement).innerText
  );

  const description = await page.$eval(
    'yt-formatted-string[id="description"]',
    (el) => (el as HTMLElement).innerHTML
  );

  const videoCount = await page.$eval(
    'yt-formatted-string[id="videos-count"]',
    (el) => parseSubscribers((el as HTMLElement).innerText)
  );

  const location = await page.$eval(
    '#details-container > table > tbody > tr:nth-child(2) > td:nth-child(2) > yt-formatted-string',
    (el) => (el as HTMLElement).innerText
  );

  const joined = await page.$eval(
    '#right-column > yt-formatted-string:nth-child(2) > span:nth-child(2)',
    (el) => (el as HTMLElement).innerText
  );

  const views = await page.$eval(
    '#right-column > yt-formatted-string:nth-child(3)',
    (el) => convertStringToNumber((el as HTMLElement).innerText)
  );

  const linksEntries: [string, string][] = [];
  const linkElements = await page.$$(
    '#link-list-container > yt-channel-external-link-view-model'
  );

  // Iterate over the selected link items in linkElements
  for (let linkElem of linkElements) {
    const headerSelector = '.yt-channel-external-link-view-model-wiz__title';
    const urlSelector = '.yt-channel-external-link-view-model-wiz__link > a';

    const header: string = await linkElem.$eval(
      headerSelector,
      (el) => (el as HTMLElement).innerText
    );
    const url: string = await linkElem.$eval(
      urlSelector,
      (el) => (el as HTMLElement).innerText
    );

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
