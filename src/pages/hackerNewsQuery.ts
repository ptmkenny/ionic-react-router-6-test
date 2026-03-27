import { use } from 'react';

export type HackerNewsStory = Readonly<{
  by: string;
  id: number;
  title: string;
  url?: string;
}>;

type HackerNewsItemResponse = Readonly<{
  by?: string;
  id?: number;
  title?: string;
  type?: string;
  url?: string;
}>;

const hackerNewsApiBaseUrl = 'https://hacker-news.firebaseio.com/v0';
const topStoriesUrl = `${hackerNewsApiBaseUrl}/topstories.json`;
const storyLimit = 5;

let storiesPromise: Promise<readonly HackerNewsStory[]> | undefined;

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return (await response.json()) as T;
};

const isHackerNewsStory = (
  item: HackerNewsItemResponse,
): item is HackerNewsStory & { type?: string } =>
  typeof item.id === 'number' &&
  typeof item.by === 'string' &&
  typeof item.title === 'string';

const isSupportedStory = (
  item: HackerNewsItemResponse,
): item is HackerNewsStory & { type: 'story' } =>
  item.type === 'story' && isHackerNewsStory(item);

const loadTopStories = async (): Promise<readonly HackerNewsStory[]> => {
  const storyIds = await fetchJson<number[]>(topStoriesUrl);
  const recentStoryIds = storyIds.slice(0, storyLimit);
  const storyResponses = await Promise.all(
    recentStoryIds.map((storyId) =>
      fetchJson<HackerNewsItemResponse>(
        `${hackerNewsApiBaseUrl}/item/${storyId}.json`,
      ),
    ),
  );

  return storyResponses
    .filter(isSupportedStory)
    .map((item) =>
      Object.freeze({
        by: item.by,
        id: item.id,
        title: item.title,
        url: item.url,
      }),
    );
};

const getTopStoriesPromise = (): Promise<readonly HackerNewsStory[]> => {
  if (!storiesPromise) {
    storiesPromise = loadTopStories();
  }
  return storiesPromise;
};

export const useTopStoriesQuery = (): readonly HackerNewsStory[] =>
  use(getTopStoriesPromise());
