/**
 * Utility functions to extract search keywords from referrer URLs
 */

export interface SearchKeywordResult {
  keyword: string | null;
  searchEngine: string | null;
}

/**
 * Extract search keyword and engine from referrer URL
 */
export function extractSearchKeyword(referrer: string | null | undefined): SearchKeywordResult {
  if (!referrer) {
    return { keyword: null, searchEngine: null };
  }

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    // Google Search
    if (hostname.includes('google.com') || hostname.includes('google.co')) {
      const query = url.searchParams.get('q');
      if (query) {
        return {
          keyword: decodeURIComponent(query).trim(),
          searchEngine: 'google',
        };
      }
    }

    // Bing Search
    if (hostname.includes('bing.com')) {
      const query = url.searchParams.get('q');
      if (query) {
        return {
          keyword: decodeURIComponent(query).trim(),
          searchEngine: 'bing',
        };
      }
    }

    // Yahoo Search
    if (hostname.includes('yahoo.com') || hostname.includes('search.yahoo.com')) {
      const query = url.searchParams.get('p') || url.searchParams.get('q');
      if (query) {
        return {
          keyword: decodeURIComponent(query).trim(),
          searchEngine: 'yahoo',
        };
      }
    }

    // DuckDuckGo
    if (hostname.includes('duckduckgo.com')) {
      const query = url.searchParams.get('q');
      if (query) {
        return {
          keyword: decodeURIComponent(query).trim(),
          searchEngine: 'duckduckgo',
        };
      }
    }

    // Yandex
    if (hostname.includes('yandex.com') || hostname.includes('yandex.ru')) {
      const query = url.searchParams.get('text');
      if (query) {
        return {
          keyword: decodeURIComponent(query).trim(),
          searchEngine: 'yandex',
        };
      }
    }

    // Baidu
    if (hostname.includes('baidu.com')) {
      const query = url.searchParams.get('wd') || url.searchParams.get('word');
      if (query) {
        return {
          keyword: decodeURIComponent(query).trim(),
          searchEngine: 'baidu',
        };
      }
    }

    // Ask.com
    if (hostname.includes('ask.com')) {
      const query = url.searchParams.get('q');
      if (query) {
        return {
          keyword: decodeURIComponent(query).trim(),
          searchEngine: 'ask',
        };
      }
    }

    // AOL Search
    if (hostname.includes('aol.com') || hostname.includes('search.aol.com')) {
      const query = url.searchParams.get('q');
      if (query) {
        return {
          keyword: decodeURIComponent(query).trim(),
          searchEngine: 'aol',
        };
      }
    }

    // Ecosia
    if (hostname.includes('ecosia.org')) {
      const query = url.searchParams.get('q');
      if (query) {
        return {
          keyword: decodeURIComponent(query).trim(),
          searchEngine: 'ecosia',
        };
      }
    }

    // Other search engines - try common query parameters
    const commonParams = ['q', 'query', 'search', 'keyword', 'terms'];
    for (const param of commonParams) {
      const query = url.searchParams.get(param);
      if (query) {
        return {
          keyword: decodeURIComponent(query).trim(),
          searchEngine: 'other',
        };
      }
    }

    return { keyword: null, searchEngine: null };
  } catch (error) {
    // Invalid URL, return null
    return { keyword: null, searchEngine: null };
  }
}

/**
 * Check if referrer is from a search engine
 */
export function isSearchEngineReferrer(referrer: string | null | undefined): boolean {
  if (!referrer) return false;
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    const searchEngines = [
      'google.com',
      'google.co',
      'bing.com',
      'yahoo.com',
      'duckduckgo.com',
      'yandex.com',
      'yandex.ru',
      'baidu.com',
      'ask.com',
      'aol.com',
      'ecosia.org',
    ];
    
    return searchEngines.some(engine => hostname.includes(engine));
  } catch {
    return false;
  }
}

