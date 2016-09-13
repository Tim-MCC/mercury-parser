import {
  getScore,
  setScore,
  getOrInitScore,
  scoreCommas,
} from 'extractors/generic/content/scoring';

import { CLEAN_CONDITIONALLY_TAGS } from './constants';
import { normalizeSpaces } from '../text';
import { linkDensity } from './index';

function removeUnlessContent($node, $, weight) {
    // Explicitly save entry-content-asset tags, which are
    // noted as valuable in the Publisher guidelines. For now
    // this works everywhere. We may want to consider making
    // this less of a sure-thing later.
  if ($node.hasClass('entry-content-asset')) {
    return;
  }

  const content = normalizeSpaces($node.text());

  if (scoreCommas(content) < 10) {
    const pCount = $('p', $node).length;
    const inputCount = $('input', $node).length;

      // Looks like a form, too many inputs.
    if (inputCount > (pCount / 3)) {
      $node.remove();
      return;
    }

    const contentLength = content.length;
    const imgCount = $('img', $node).length;

      // Content is too short, and there are no images, so
      // this is probably junk content.
    if (contentLength < 25 && imgCount === 0) {
      $node.remove();
      return;
    }

    const density = linkDensity($node);

      // Too high of link density, is probably a menu or
      // something similar.
      // console.log(weight, density, contentLength)
    if (weight < 25 && density > 0.2 && contentLength > 75) {
      $node.remove();
      return;
    }

      // Too high of a link density, despite the score being
      // high.
    if (weight >= 25 && density > 0.5) {
        // Don't remove the node if it's a list and the
        // previous sibling starts with a colon though. That
        // means it's probably content.
      const tagName = $node.get(0).tagName;
      const nodeIsList = tagName === 'ol' || tagName === 'ul';
      if (nodeIsList) {
        const previousNode = $node.prev();
        if (previousNode && normalizeSpaces(previousNode.text()).slice(-1) === ':') {
          return;
        }
      }

      $node.remove();
      return;
    }

    const scriptCount = $('script', $node).length;

      // Too many script tags, not enough content.
    if (scriptCount > 0 && contentLength < 150) {
      $node.remove();
      return;
    }
  }
}

// Given an article, clean it of some superfluous content specified by
// tags. Things like forms, ads, etc.
//
// Tags is an array of tag name's to search through. (like div, form,
// etc)
//
// Return this same doc.
export default function cleanTags($article, $) {
  $(CLEAN_CONDITIONALLY_TAGS, $article).each((index, node) => {
    const $node = $(node);
    let weight = getScore($node);
    if (!weight) {
      weight = getOrInitScore($node, $);
      setScore($node, $, weight);
    }

    // drop node if its weight is < 0
    if (weight < 0) {
      $node.remove();
    } else {
      // deteremine if node seems like content
      removeUnlessContent($node, $, weight);
    }
  });

  return $;
}

