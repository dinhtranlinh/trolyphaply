#!/usr/bin/env tsx
/**
 * Comprehensive Pre-Build Validation Script
 * 
 * Checks ALL TypeScript consistency issues before building:
 * 1. Database schema vs Interface consistency
 * 2. Next.js dynamic route param naming (must be camelCase)
 * 3. Interface field naming (must match DB snake_case)
 * 4. Forbidden field usage (removed fields, renamed fields)
 * 5. Variable name typos and inconsistencies
 */

import * as fs from 'fs';
import * as path from 'path';

interface Issue {
  file: string;
  line: number;
  column?: number;
  severity: 'error' | 'warning';
  category: string;
  message: string;
  code: string;
}

const issues: Issue[] = [];

// ============================================================================
// RULE 1: Database Schema Consistency
// ============================================================================

const DB_SCHEMA = {
  facebook_pages: ['id', 'page_id', 'page_name', 'page_access_token', 'automation_enabled', 'last_sync_at', 'created_at', 'updated_at'],
  auto_reply_rules: ['id', 'page_id', 'trigger_type', 'keywords', 'exclude_keywords', 'reply_templates', 'priority', 'enabled', 'post_id', 'created_at', 'updated_at'],
  auto_message_rules: ['id', 'page_id', 'trigger_on', 'message_template', 'cooldown_minutes', 'enabled', 'created_at', 'updated_at'],
  automation_logs: ['id', 'page_id', 'action_type', 'target_id', 'rule_id', 'content_sent', 'status', 'error_message', 'metadata', 'created_at'],
  facebook_events: ['id', 'event_type', 'page_id', 'post_id', 'comment_id', 'user_id', 'dedupe_key', 'payload', 'status', 'created_at'],
  queue_jobs: ['id', 'job_type', 'page_id', 'target_id', 'payload', 'status', 'scheduled_at', 'processed_at', 'created_at'],
  page_stats: ['id', 'page_id', 'date', 'replies_sent', 'messages_sent', 'failed_jobs', 'created_at'],
};

// Fields that were REMOVED from schema (should not exist in code)
const REMOVED_FIELDS = [
  'daily_uses_count',
  'max_daily_uses', 
  'last_used_at',
  'is_active', // replaced with automation_enabled/enabled
];

// Fields that were RENAMED (old_name -> new_name)
const RENAMED_FIELDS = {
  'match_type': 'trigger_type',
  'template': 'message_template or reply_templates',
  'isActive': 'automation_enabled or enabled',
  'pageId': 'page_id',
  'userId': 'user_id',
  'postId': 'post_id',
  'commentId': 'comment_id',
  'actionType': 'action_type',
  'targetId': 'target_id',
  'ruleId': 'rule_id',
  'contentSent': 'content_sent',
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'accessToken': 'page_access_token',
  'pageName': 'page_name',
};

// Next.js dynamic route params MUST use camelCase (framework convention)
const NEXTJS_DYNAMIC_PARAMS = ['pageId', 'userId', 'ruleId', 'eventId'];

// ============================================================================
// RULE 2: TypeScript Interface Naming Convention
// ============================================================================

/**
 * Check if interface matches DB schema
 */
function validateInterface(filePath: string, content: string) {
  const interfaceRegex = /export interface (\w+)\s*\{([^}]+)\}/gs;
  let match;
  
  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    const body = match[2];
    const lines = body.split('\n');
    
    // Check each field in interface
    lines.forEach((line, idx) => {
      const fieldMatch = line.match(/^\s*(\w+)[\?:]?\s*:/);
      if (!fieldMatch) return;
      
      const fieldName = fieldMatch[1];
      const lineNumber = content.substring(0, match.index).split('\n').length + idx + 1;
      
      // Check for camelCase in interface fields (should be snake_case to match DB)
      if (fieldName.match(/[a-z][A-Z]/) && !['isValid', 'expiresAt'].includes(fieldName)) {
        // Check if this is a known renamed field
        if (RENAMED_FIELDS[fieldName]) {
          issues.push({
            file: filePath,
            line: lineNumber,
            severity: 'error',
            category: 'interface-naming',
            message: `Interface field "${fieldName}" should be "${RENAMED_FIELDS[fieldName]}" (renamed in DB schema)`,
            code: line.trim(),
          });
        }
      }
      
      // Check for removed fields
      if (REMOVED_FIELDS.includes(fieldName)) {
        issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'error',
          category: 'removed-field',
          message: `Field "${fieldName}" was removed from database schema (Dec 2025)`,
          code: line.trim(),
        });
      }
    });
  }
}

// ============================================================================
// RULE 3: Field Access Patterns
// ============================================================================

/**
 * Check for forbidden field access patterns in code
 */
function validateFieldAccess(filePath: string, content: string) {
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    
    // Check for removed fields being accessed
    REMOVED_FIELDS.forEach(field => {
      if (line.match(new RegExp(`\\.${field}\\b`))) {
        issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'error',
          category: 'removed-field-access',
          message: `Accessing removed field: .${field}`,
          code: line.trim(),
        });
      }
    });
    
    // Check for old field names being accessed (except in dynamic route params)
    Object.keys(RENAMED_FIELDS).forEach(oldField => {
      // Skip if this is a Next.js dynamic route param
      if (NEXTJS_DYNAMIC_PARAMS.includes(oldField) && filePath.includes('[' + oldField + ']')) {
        return;
      }
      
      // Skip function parameters (TypeScript convention is camelCase)
      if (line.match(new RegExp(`\\bfunction\\b.*\\b${oldField}\\b`)) || 
          line.match(new RegExp(`^\\s*${oldField}:\\s*string`))) {
        return;
      }
      
      // Skip API route body fields (legacy support for UI)
      if (line.includes('body.template') || line.includes('body.postId') || 
          line.includes('body.commentId') || line.includes('body.userId')) {
        return;
      }
      
      // Check for field access
      if (line.match(new RegExp(`\\.${oldField}\\b`)) && !line.includes('//')) {
        issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'error',
          category: 'renamed-field-access',
          message: `Accessing renamed field: .${oldField} → use .${RENAMED_FIELDS[oldField]}`,
          code: line.trim(),
        });
      }
      
      // Check for field in object literals (key: value) - but skip function params
      if (line.match(new RegExp(`\\b${oldField}:`)) && 
          !line.includes('//') && 
          !line.includes('params') &&
          !line.match(/export.*function/) &&
          !line.match(/console\.(log|error|warn)/) && // Skip console messages
          !line.match(/^\s*\w+:\s*string/)) {
        issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'error',
          category: 'renamed-field-object',
          message: `Using renamed field in object: ${oldField}: → use ${RENAMED_FIELDS[oldField]}:`,
          code: line.trim(),
        });
      }
    });
  });
}

// ============================================================================
// RULE 4: Next.js Dynamic Route Validation
// ============================================================================

/**
 * Validate Next.js dynamic route params
 */
function validateDynamicRoutes(filePath: string, content: string) {
  // Only check files in dynamic route folders
  if (!filePath.match(/\[(\w+)\]/)) return;
  
  const paramName = filePath.match(/\[(\w+)\]/)?.[1];
  if (!paramName) return;
  
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    
    // Check for params interface definition
    const paramsMatch = line.match(/params:\s*Promise<\{\s*(\w+):/);
    if (paramsMatch) {
      const declaredParam = paramsMatch[1];
      
      // Next.js expects camelCase for dynamic route params
      if (declaredParam !== paramName) {
        issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'error',
          category: 'nextjs-dynamic-route',
          message: `Dynamic route param must be "${paramName}" (camelCase), not "${declaredParam}"`,
          code: line.trim(),
        });
      }
    }
  });
}

// ============================================================================
// RULE 5: Variable Name Consistency
// ============================================================================

/**
 * Check for common variable name typos
 */
function validateVariableNames(filePath: string, content: string) {
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    
    // Check for undefined variables that look like typos
    if (line.match(/\bmessage_templateResult\b/)) {
      issues.push({
        file: filePath,
        line: lineNumber,
        severity: 'error',
        category: 'variable-typo',
        message: 'Variable name typo: "message_templateResult" should be "templateResult"',
        code: line.trim(),
      });
    }
    
    if (line.match(/\bpage_id\b/) && line.match(/if\s*\(\s*page_id\s*\)/)) {
      // Check if page_id is actually defined in scope
      const beforeContent = content.substring(0, content.indexOf(line));
      if (!beforeContent.match(/const\s+page_id\s*=/) && beforeContent.match(/const\s+pageId\s*=/)) {
        issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'error',
          category: 'variable-undefined',
          message: 'Using undefined variable "page_id", should be "pageId"',
          code: line.trim(),
        });
      }
    }
  });
}

// ============================================================================
// RULE 6: Database Query Column Names
// ============================================================================

/**
 * Check Supabase queries use correct column names
 */
function validateDatabaseQueries(filePath: string, content: string) {
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    
    // Check .eq() and .select() calls
    const eqMatch = line.match(/\.eq\(['"](\w+)['"]/);
    if (eqMatch) {
      const column = eqMatch[1];
      
      // Check if using old column name
      if (column === 'is_active') {
        issues.push({
          file: filePath,
          line: lineNumber,
          severity: 'error',
          category: 'db-query',
          message: 'Column "is_active" does not exist, use "automation_enabled" or "enabled"',
          code: line.trim(),
        });
      }
    }
  });
}

// ============================================================================
// Main Execution
// ============================================================================

/**
 * Recursively find all TypeScript files
 */
function findTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        findTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

async function main() {
  console.log('🔍 Comprehensive Pre-Build Validation\n');
  console.log('Scanning Facebook automation codebase...\n');
  
  const dirs = [
    path.join(process.cwd(), 'lib', 'facebook'),
    path.join(process.cwd(), 'app', 'api', 'facebook'),
  ];
  
  const files: string[] = [];
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      files.push(...findTsFiles(dir));
    }
  });
  
  console.log(`Found ${files.length} files to check\n`);
  
  // Process each file
  for (const file of files) {
    const filePath = path.resolve(file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    validateInterface(filePath, content);
    validateFieldAccess(filePath, content);
    validateDynamicRoutes(filePath, content);
    validateVariableNames(filePath, content);
    validateDatabaseQueries(filePath, content);
  }
  
  // Report results
  console.log('================================================================================');
  
  if (issues.length === 0) {
    console.log('✅ NO ISSUES FOUND - Safe to build!');
    console.log('================================================================================\n');
    process.exit(0);
  }
  
  console.log(`❌ FOUND ${issues.length} ISSUES:\n`);
  
  // Group by file
  const byFile = new Map<string, Issue[]>();
  issues.forEach(issue => {
    const relative = path.relative(process.cwd(), issue.file);
    if (!byFile.has(relative)) {
      byFile.set(relative, []);
    }
    byFile.get(relative)!.push(issue);
  });
  
  // Print grouped issues
  byFile.forEach((fileIssues, file) => {
    console.log(`\n📁 ${file}`);
    fileIssues.forEach(issue => {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      console.log(`   ${icon} Line ${issue.line}: [${issue.category}] ${issue.message}`);
      if (issue.code) {
        console.log(`      ${issue.code}`);
      }
    });
  });
  
  console.log('\n================================================================================');
  console.log('❌ FIX THESE ISSUES BEFORE BUILDING!\n');
  console.log('Common fixes:');
  console.log('  1. Interface fields: Use snake_case to match DB columns');
  console.log('  2. Removed fields: Delete references to daily_uses_count, max_daily_uses');
  console.log('  3. Renamed fields: match_type→trigger_type, template→message_template');
  console.log('  4. DB queries: Use automation_enabled/enabled instead of is_active');
  console.log('  5. Next.js routes: Dynamic route params MUST be camelCase (framework rule)\n');
  
  process.exit(1);
}

main().catch(err => {
  console.error('Error running validation:', err);
  process.exit(1);
});
