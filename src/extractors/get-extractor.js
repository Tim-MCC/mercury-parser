import URL from 'url';

import Extractors from './all';
import GenericExtractor from './generic';

export default function getExtractor(url) {
  const parsedUrl = URL.parse(url);
  const { hostname } = parsedUrl;
  const baseDomain = hostname.split('.').slice(-2).join('.');

  return Extractors[hostname] || Extractors[baseDomain] || GenericExtractor;
}
