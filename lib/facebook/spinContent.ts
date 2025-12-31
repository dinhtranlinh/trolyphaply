/**
 * Spin Content Engine
 * Parse and generate variations from spin syntax: [option1|option2|option3]
 * Replace placeholders: {full_name}, {first_name}, {page_name}
 */

export interface SpinConfig {
  message_template: string;
  placeholders?: Record<string, string>;
}

export interface SpinResult {
  original: string;
  spun: string;
  placeholdersUsed: string[];
  spinGroupsCount: number;
}

/**
 * Parse spin syntax [a|b|c] and return random option
 */
function parseSpin(text: string): string {
  // Match [option1|option2|option3]
  const spinPattern = /\[([^\]]+)\]/g;
  
  return text.replace(spinPattern, (match, group) => {
    const options = group.split('|').map((opt: string) => opt.trim());
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  });
}

/**
 * Replace placeholders {key} with values
 */
function replacePlaceholders(
  text: string,
  placeholders: Record<string, string>
): { text: string; used: string[] } {
  const used: string[] = [];
  const placeholderPattern = /\{([^}]+)\}/g;
  
  const result = text.replace(placeholderPattern, (match, key) => {
    const value = placeholders[key];
    if (value !== undefined) {
      used.push(key);
      return value;
    }
    return match; // Keep original if no value
  });
  
  return { text: result, used };
}

/**
 * Count spin groups in template
 */
function countSpinGroups(text: string): number {
  const matches = text.match(/\[([^\]]+)\]/g);
  return matches ? matches.length : 0;
}

/**
 * Generate spun content from template
 */
export function spinContent(config: SpinConfig): SpinResult {
  const { message_template, placeholders = {} } = config;
  
  // Step 1: Parse spin syntax
  let spun = parseSpin(message_template);
  
  // Step 2: Replace placeholders
  const { text: final, used } = replacePlaceholders(spun, placeholders);
  
  return {
    original: message_template,
    spun: final,
    placeholdersUsed: used,
    spinGroupsCount: countSpinGroups(message_template),
  };
}

/**
 * Generate multiple unique variations (for preview)
 */
export function generateVariations(
  message_template: string,
  placeholders: Record<string, string> = {},
  count: number = 10
): string[] {
  const variations = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 10; // Avoid infinite loop
  
  while (variations.size < count && attempts < maxAttempts) {
    const result = spinContent({ message_template, placeholders });
    variations.add(result.spun);
    attempts++;
  }
  
  return Array.from(variations);
}

/**
 * Validate spin syntax
 */
export function validateSpinSyntax(message_template: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for unclosed brackets
  const openBrackets = (message_template.match(/\[/g) || []).length;
  const closeBrackets = (message_template.match(/\]/g) || []).length;
  
  if (openBrackets !== closeBrackets) {
    errors.push(`Unclosed brackets: ${openBrackets} opening, ${closeBrackets} closing`);
  }
  
  // Check for empty spin groups
  if (/\[\s*\]/.test(message_template)) {
    errors.push('Empty spin group found: []');
  }
  
  // Check for spin groups with only one option
  const spinGroups = message_template.match(/\[([^\]]+)\]/g) || [];
  spinGroups.forEach((group: string, index: number) => {
    const options = group.slice(1, -1).split('|');
    if (options.length === 1) {
      errors.push(`Spin group ${index + 1} has only one option: ${group}`);
    }
  });
  
  // Check for nested brackets (not supported)
  if (/\[[^\]]*\[[^\]]*\]/.test(message_template)) {
    errors.push('Nested spin groups are not supported');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract placeholders from template
 */
export function extractPlaceholders(message_template: string): string[] {
  const placeholderPattern = /\{([^}]+)\}/g;
  const matches = [...message_template.matchAll(placeholderPattern)];
  return [...new Set(matches.map(m => m[1]))];
}

/**
 * Get standard placeholders for Facebook comments
 */
export function getStandardPlaceholders(userData?: {
  name?: string;
  id?: string;
}): Record<string, string> {
  const placeholders: Record<string, string> = {};
  
  if (userData?.name) {
    placeholders.full_name = userData.name;
    
    // Extract first name (everything before first space)
    const firstName = userData.name.split(' ')[0];
    placeholders.first_name = firstName;
  }
  
  return placeholders;
}

/**
 * Sanitize message for Facebook API
 */
export function sanitizeMessage(message: string): string {
  // Remove excessive whitespace
  let sanitized = message.replace(/\s+/g, ' ').trim();
  
  // Remove any remaining spin syntax artifacts
  sanitized = sanitized.replace(/[\[\]]/g, '');
  
  // Ensure not empty
  if (!sanitized) {
    sanitized = '...'; // Fallback
  }
  
  return sanitized;
}

/**
 * Check if two messages are too similar (prevent duplicates)
 */
export function areSimilar(
  message1: string,
  message2: string,
  threshold: number = 0.8
): boolean {
  // Simple similarity check based on common words
  const words1 = message1.toLowerCase().split(/\s+/);
  const words2 = message2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const similarity = intersection.size / union.size;
  return similarity >= threshold;
}

/**
 * Select next template with deduplication
 */
export function selectTemplate(
  templates: string[],
  recentMessages: string[],
  placeholders: Record<string, string> = {}
): string {
  if (templates.length === 0) {
    throw new Error('No templates available');
  }
  
  if (templates.length === 1) {
    return spinContent({ message_template: templates[0], placeholders }).spun;
  }
  
  // Try to find a template that generates different message
  const maxAttempts = templates.length * 3;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const randomIndex = Math.floor(Math.random() * templates.length);
    const templateStr = templates[randomIndex];
    const spun = spinContent({ message_template: templateStr, placeholders }).spun;
    
    // Check if too similar to recent messages
    const tooSimilar = recentMessages.some(recent => 
      areSimilar(spun, recent, 0.85)
    );
    
    if (!tooSimilar) {
      return spun;
    }
    
    attempts++;
  }
  
  // Fallback: return spun version of random template
  const randomIndex = Math.floor(Math.random() * templates.length);
  return spinContent({ message_template: templates[randomIndex], placeholders }).spun;
}
