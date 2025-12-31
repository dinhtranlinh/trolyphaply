/**
 * Validation Service
 * 
 * Validates reply rule templates, spin syntax, and content quality.
 */

import { generateVariations } from './spinContent';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateValidationOptions {
  minLength?: number;
  maxLength?: number;
  minVariations?: number;
  requireSpinSyntax?: boolean;
}

/**
 * Validate spin syntax [option1|option2|option3]
 */
export function validateSpinSyntax(message_template: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for balanced brackets
  const openBrackets = (message_template.match(/\[/g) || []).length;
  const closeBrackets = (message_template.match(/\]/g) || []).length;

  if (openBrackets !== closeBrackets) {
    errors.push(
      `Unbalanced brackets: ${openBrackets} opening '[' but ${closeBrackets} closing ']'`
    );
    return { valid: false, errors, warnings };
  }

  // Check for nested brackets (not supported)
  const nestedPattern = /\[[^\]]*\[/;
  if (nestedPattern.test(message_template)) {
    errors.push('Nested brackets are not supported: [[option]]');
  }

  // Check for empty spin groups []
  const emptyPattern = /\[\s*\]/;
  if (emptyPattern.test(message_template)) {
    errors.push('Empty spin group found: []');
  }

  // Check for single-option spin groups [only_one]
  const spinGroups = message_template.match(/\[([^\]]+)\]/g);
  if (spinGroups) {
    spinGroups.forEach((group: string, index: number) => {
      const content = group.slice(1, -1); // Remove [ ]
      const options = content.split('|').map((opt: string) => opt.trim());

      if (options.length === 1) {
        warnings.push(
          `Spin group #${index + 1} has only 1 option: "${content}" - consider removing brackets`
        );
      }

      // Check for empty options
      const emptyOptions = options.filter((opt: string) => opt === '');
      if (emptyOptions.length > 0) {
        errors.push(
          `Spin group #${index + 1} has empty options: "${group}"`
        );
      }

      // Check for duplicate options
      const uniqueOptions = new Set(options);
      if (uniqueOptions.size < options.length) {
        warnings.push(
          `Spin group #${index + 1} has duplicate options: "${group}"`
        );
      }
    });
  }

  const valid = errors.length === 0;
  return { valid, errors, warnings };
}

/**
 * Validate placeholder syntax {key}
 */
export function validatePlaceholders(message_template: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for balanced braces
  const openBraces = (message_template.match(/\{/g) || []).length;
  const closeBraces = (message_template.match(/\}/g) || []).length;

  if (openBraces !== closeBraces) {
    errors.push(
      `Unbalanced braces: ${openBraces} opening '{' but ${closeBraces} closing '}'`
    );
    return { valid: false, errors, warnings };
  }

  // Check for empty placeholders {}
  const emptyPattern = /\{\s*\}/;
  if (emptyPattern.test(message_template)) {
    errors.push('Empty placeholder found: {}');
  }

  // Check for nested braces (not supported)
  const nestedPattern = /\{[^}]*\{/;
  if (nestedPattern.test(message_template)) {
    errors.push('Nested braces are not supported: {{key}}');
  }

  // Extract all placeholders and check validity
  const placeholderPattern = /\{([^}]+)\}/g;
  const placeholders: string[] = [];
  let match;

  while ((match = placeholderPattern.exec(message_template)) !== null) {
    const key = match[1].trim();
    placeholders.push(key);

    // Check for invalid characters in key
    const validKeyPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!validKeyPattern.test(key)) {
      errors.push(
        `Invalid placeholder key: "{${key}}" - use only letters, numbers, and underscores`
      );
    }
  }

  // List supported placeholders
  const supportedPlaceholders = ['full_name', 'first_name', 'page_name'];
  const unsupportedPlaceholders = placeholders.filter(
    (key) => !supportedPlaceholders.includes(key)
  );

  if (unsupportedPlaceholders.length > 0) {
    warnings.push(
      `Unsupported placeholders: {${unsupportedPlaceholders.join('}, {')}} - supported: {${supportedPlaceholders.join('}, {')}}`
    );
  }

  const valid = errors.length === 0;
  return { valid, errors, warnings };
}

/**
 * Validate template length
 */
export function validateTemplateLength(
  message_template: string,
  options: TemplateValidationOptions = {}
): ValidationResult {
  const {
    minLength = 10,
    maxLength = 2000,
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  const length = message_template.trim().length;

  if (length === 0) {
    errors.push('Template is empty');
    return { valid: false, errors, warnings };
  }

  if (length < minLength) {
    errors.push(
      `Template too short: ${length} characters (minimum: ${minLength})`
    );
  }

  if (length > maxLength) {
    errors.push(
      `Template too long: ${length} characters (maximum: ${maxLength})`
    );
  }

  // Warn if template is very short (likely low quality)
  if (length < 20 && length >= minLength) {
    warnings.push(
      'Template is very short - consider adding more content for better engagement'
    );
  }

  const valid = errors.length === 0;
  return { valid, errors, warnings };
}

/**
 * Validate that template generates enough unique variations
 */
export function validateVariations(
  message_template: string,
  options: TemplateValidationOptions = {}
): ValidationResult {
  const { minVariations = 5 } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Generate variations to test
  const variations = generateVariations(message_template, {}, 20);
  const uniqueVariations = new Set(variations);

  if (uniqueVariations.size < minVariations) {
    errors.push(
      `Not enough unique variations: ${uniqueVariations.size} found (minimum: ${minVariations}) - add more spin groups or options`
    );
  }

  // Warn if variations are too similar
  if (uniqueVariations.size < variations.length * 0.5) {
    warnings.push(
      'Many duplicate variations detected - consider adding more spin options'
    );
  }

  const valid = errors.length === 0;
  return { valid, errors, warnings };
}

/**
 * Comprehensive template validation
 */
export function validateTemplate(
  message_template: string,
  options: TemplateValidationOptions = {}
): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // 1. Validate length
  const lengthResult = validateTemplateLength(message_template, options);
  allErrors.push(...lengthResult.errors);
  allWarnings.push(...lengthResult.warnings);

  // Stop if empty
  if (message_template.trim().length === 0) {
    return { valid: false, errors: allErrors, warnings: allWarnings };
  }

  // 2. Validate spin syntax
  const spinResult = validateSpinSyntax(message_template);
  allErrors.push(...spinResult.errors);
  allWarnings.push(...spinResult.warnings);

  // 3. Validate placeholders
  const placeholderResult = validatePlaceholders(message_template);
  allErrors.push(...placeholderResult.errors);
  allWarnings.push(...placeholderResult.warnings);

  // 4. Check if spin syntax is required
  const hasSpinSyntax = /\[([^\]]+)\]/.test(message_template);
  if (options.requireSpinSyntax && !hasSpinSyntax) {
    allErrors.push(
      'Template must include spin syntax [option1|option2] to generate variations'
    );
  }

  // 5. Validate variations (only if spin syntax is valid)
  if (spinResult.valid && hasSpinSyntax) {
    const variationsResult = validateVariations(message_template, options);
    allErrors.push(...variationsResult.errors);
    allWarnings.push(...variationsResult.warnings);
  }

  const valid = allErrors.length === 0;
  return { valid, errors: allErrors, warnings: allWarnings };
}

/**
 * Validate keywords array
 */
export function validateKeywords(keywords: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(keywords)) {
    errors.push('Keywords must be an array');
    return { valid: false, errors, warnings };
  }

  if (keywords.length === 0) {
    warnings.push('No keywords specified - rule will not match any comments');
  }

  // Check for empty keywords
  const emptyKeywords = keywords.filter((kw) => !kw || kw.trim() === '');
  if (emptyKeywords.length > 0) {
    errors.push(`Found ${emptyKeywords.length} empty keyword(s)`);
  }

  // Check for duplicate keywords
  const uniqueKeywords = new Set(keywords.map((kw) => kw.toLowerCase().trim()));
  if (uniqueKeywords.size < keywords.length) {
    warnings.push(
      `Found duplicate keywords (${keywords.length - uniqueKeywords.size} duplicates)`
    );
  }

  // Check for very short keywords (likely spam)
  const shortKeywords = keywords.filter((kw) => kw.trim().length === 1);
  if (shortKeywords.length > 0) {
    warnings.push(
      `Found ${shortKeywords.length} single-character keyword(s): ${shortKeywords.join(', ')} - may cause false matches`
    );
  }

  // Check for very long keywords (likely not keywords)
  const longKeywords = keywords.filter((kw) => kw.trim().length > 50);
  if (longKeywords.length > 0) {
    warnings.push(
      `Found ${longKeywords.length} very long keyword(s) (>50 chars) - consider shortening`
    );
  }

  const valid = errors.length === 0;
  return { valid, errors, warnings };
}

/**
 * Validate reply rule input
 */
export interface ReplyRuleInput {
  name: string;
  trigger_type?: 'all' | 'keyword'; // DB column name
  keywords?: string[];
  exclude_keywords?: string[];
  message_template: string;
  priority?: number;
}

export function validateReplyRule(input: ReplyRuleInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate name
  if (!input.name || input.name.trim().length === 0) {
    errors.push('Rule name is required');
  } else if (input.name.trim().length < 3) {
    errors.push('Rule name must be at least 3 characters');
  } else if (input.name.length > 100) {
    errors.push('Rule name must be less than 100 characters');
  }

  // Validate trigger_type
  const triggerType = input.trigger_type;
  if (!triggerType || !['all', 'keyword'].includes(triggerType)) {
    errors.push('trigger_type must be "all" or "keyword"');
  }

  // Validate keywords if trigger_type is keyword
  if (triggerType === 'keyword') {
    if (!input.keywords || input.keywords.length === 0) {
      errors.push('Keywords are required when trigger_type is "keyword"');
    } else {
      const keywordsResult = validateKeywords(input.keywords);
      errors.push(...keywordsResult.errors);
      warnings.push(...keywordsResult.warnings);
    }
  }

  // Validate exclude_keywords
  if (input.exclude_keywords && input.exclude_keywords.length > 0) {
    const excludeResult = validateKeywords(input.exclude_keywords);
    errors.push(
      ...excludeResult.errors.map((err) => `Exclude keywords: ${err}`)
    );
    warnings.push(
      ...excludeResult.warnings.map((warn) => `Exclude keywords: ${warn}`)
    );
  }

  // Validate template
  const templateResult = validateTemplate(input.message_template, {
    minLength: 10,
    maxLength: 2000,
    minVariations: 5,
    requireSpinSyntax: true,
  });
  errors.push(...templateResult.errors);
  warnings.push(...templateResult.warnings);

  // Validate priority
  if (input.priority !== undefined) {
    if (!Number.isInteger(input.priority)) {
      errors.push('Priority must be an integer');
    } else if (input.priority < 0 || input.priority > 100) {
      errors.push('Priority must be between 0 and 100');
    }
  }

  const valid = errors.length === 0;
  return { valid, errors, warnings };
}
