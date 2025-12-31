/**
 * Rule Matcher
 * 
 * Matches Facebook comments against auto-reply rules.
 * Handles keyword matching, blacklist filtering, and priority ordering.
 */

import { ReplyRule } from './replyRulesService';

export interface Comment {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
  created_time: string;
}

export interface MatchResult {
  matched: boolean;
  rule?: ReplyRule;
  reason?: string;
}

/**
 * Normalize text for matching (lowercase, trim, remove extra spaces)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Check if text contains Vietnamese diacritics
 */
function hasVietnameseDiacritics(text: string): boolean {
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnamesePattern.test(text);
}

/**
 * Remove Vietnamese diacritics for fuzzy matching
 */
function removeDiacritics(text: string): string {
  const diacriticsMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
  };

  return text.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi, (char) => {
    return diacriticsMap[char.toLowerCase()] || char;
  });
}

/**
 * Check if comment text contains a keyword (case-insensitive, Vietnamese-aware)
 */
function containsKeyword(text: string, keyword: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);

  // Exact match
  if (normalizedText.includes(normalizedKeyword)) {
    return true;
  }

  // Fuzzy match without diacritics
  const textWithoutDiacritics = removeDiacritics(normalizedText);
  const keywordWithoutDiacritics = removeDiacritics(normalizedKeyword);

  return textWithoutDiacritics.includes(keywordWithoutDiacritics);
}

/**
 * Check if comment contains any blacklist/exclude keywords
 */
function containsExcludeKeyword(text: string, excludeKeywords: string[]): boolean {
  if (!excludeKeywords || excludeKeywords.length === 0) {
    return false;
  }

  return excludeKeywords.some((keyword) => containsKeyword(text, keyword));
}

/**
 * Check if comment is from the page itself (self-comment)
 */
export function isSelfComment(comment: Comment, page_id: string): boolean {
  return comment.from.id === page_id;
}

/**
 * Check if comment is empty or too short
 */
function isValidComment(comment: Comment): boolean {
  const message = comment.message?.trim();
  if (!message) {
    return false;
  }

  // At least 2 characters (avoid single-char spam)
  return message.length >= 2;
}

/**
 * Match a comment against a single rule
 */
function matchRule(comment: Comment, rule: ReplyRule): MatchResult {
  const message = comment.message || '';

  // Check trigger_type
  if (rule.trigger_type === 'all') {
    // Match all comments (no keyword check)
    return { matched: true, rule };
  }

  if (rule.trigger_type === 'keyword') {
    // Must have keywords
    if (!rule.keywords || rule.keywords.length === 0) {
      return {
        matched: false,
        reason: 'Rule has no keywords defined',
      };
    }

    // Check if any keyword matches
    const hasMatchingKeyword = rule.keywords.some((keyword) =>
      containsKeyword(message, keyword)
    );

    if (hasMatchingKeyword) {
      return { matched: true, rule };
    }

    return {
      matched: false,
      reason: 'No matching keywords found',
    };
  }

  return {
    matched: false,
    reason: `Unknown trigger_type: ${rule.trigger_type}`,
  };
}

/**
 * Find the best matching rule for a comment
 * Returns the highest priority rule that matches
 */
export function findMatchingRule(
  comment: Comment,
  rules: ReplyRule[],
  page_id: string
): MatchResult {
  // Validate comment
  if (!isValidComment(comment)) {
    return {
      matched: false,
      reason: 'Invalid comment (empty or too short)',
    };
  }

  // Check if self-comment
  if (isSelfComment(comment, page_id)) {
    return {
      matched: false,
      reason: 'Self-comment (from page itself)',
    };
  }

  // Filter and sort rules by priority (already sorted from DB)
  const activeRules = rules.filter((rule) => rule.enabled);

  if (activeRules.length === 0) {
    return {
      matched: false,
      reason: 'No active rules available',
    };
  }

  // Try each rule in priority order
  for (const rule of activeRules) {
    // Check exclude keywords first
    if (containsExcludeKeyword(comment.message, rule.exclude_keywords || [])) {
      console.log(`⊘ Rule "${rule.name}" skipped: exclude keyword matched`);
      continue;
    }

    // Check if rule matches
    const result = matchRule(comment, rule);

    if (result.matched) {
      console.log(`✓ Rule "${rule.name}" matched (priority: ${rule.priority})`);
      return result;
    }
  }

  return {
    matched: false,
    reason: 'No matching rules found',
  };
}

/**
 * Test if a comment would match any rules (for preview/testing)
 */
export function testCommentAgainstRules(
  commentText: string,
  rules: ReplyRule[]
): {
  matches: Array<{
    rule: ReplyRule;
    priority: number;
    matchType: string;
  }>;
  topMatch?: ReplyRule;
} {
  const testComment: Comment = {
    id: 'test',
    message: commentText,
    from: {
      id: 'test-user',
      name: 'Test User',
    },
    created_time: new Date().toISOString(),
  };

  const matches: Array<{
    rule: ReplyRule;
    priority: number;
    matchType: string;
  }> = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;

    // Check exclude keywords
    if (containsExcludeKeyword(commentText, rule.exclude_keywords || [])) {
      continue;
    }

    // Check if matches
    const result = matchRule(testComment, rule);
    if (result.matched && result.rule) {
      matches.push({
        rule: result.rule,
        priority: result.rule.priority,
        matchType: result.rule.trigger_type,
      });
    }
  }

  // Sort by priority
  matches.sort((a, b) => b.priority - a.priority);

  return {
    matches,
    topMatch: matches.length > 0 ? matches[0].rule : undefined,
  };
}

/**
 * Explain why a comment didn't match any rules (for debugging)
 */
export function explainNoMatch(
  comment: Comment,
  rules: ReplyRule[],
  page_id: string
): string {
  if (!isValidComment(comment)) {
    return 'Comment is invalid (empty or too short)';
  }

  if (isSelfComment(comment, page_id)) {
    return 'Comment is from the page itself (self-comment)';
  }

  const activeRules = rules.filter((rule) => rule.enabled);

  if (activeRules.length === 0) {
    return 'No active rules configured for this page';
  }

  const explanations: string[] = [];

  for (const rule of activeRules) {
    if (containsExcludeKeyword(comment.message, rule.exclude_keywords || [])) {
      explanations.push(`Rule "${rule.name}": Excluded by blacklist keyword`);
      continue;
    }

    if (rule.trigger_type === 'keyword') {
      if (!rule.keywords || rule.keywords.length === 0) {
        explanations.push(`Rule "${rule.name}": No keywords defined`);
      } else {
        explanations.push(
          `Rule "${rule.name}": None of these keywords matched: ${rule.keywords.join(', ')}`
        );
      }
    }
  }

  if (explanations.length === 0) {
    return 'Unknown reason - no rules matched';
  }

  return explanations.join('\n');
}

/**
 * Get keyword variations for fuzzy matching
 */
export function getKeywordVariations(keyword: string): string[] {
  const variations: string[] = [keyword];

  // Add lowercase version
  const lower = keyword.toLowerCase();
  if (lower !== keyword) {
    variations.push(lower);
  }

  // Add uppercase version
  const upper = keyword.toUpperCase();
  if (upper !== keyword) {
    variations.push(upper);
  }

  // Add version without diacritics
  if (hasVietnameseDiacritics(keyword)) {
    const noDiacritics = removeDiacritics(keyword);
    variations.push(noDiacritics);
    variations.push(noDiacritics.toLowerCase());
    variations.push(noDiacritics.toUpperCase());
  }

  // Remove duplicates
  return [...new Set(variations)];
}
