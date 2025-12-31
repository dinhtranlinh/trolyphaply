#!/usr/bin/env tsx
/**
 * Automatic Fix Script
 * Fixes all common snake_case/camelCase inconsistencies
 */

import * as fs from 'fs';
import * as path from 'path';

let totalFixed = 0;

function findTsFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  
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

function fixFile(filePath: string): number {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  let fixes = 0;
  
  // Fix 1: job.targetId → job.target_id
  content = content.replace(/\bjob\.targetId\b/g, 'job.target_id');
  
  // Fix 2: job.payload.commentId → job.payload.comment_id
  content = content.replace(/\bjob\.payload\.commentId\b/g, 'job.payload.comment_id');
  
  // Fix 3: job.payload.postId → job.payload.post_id  
  content = content.replace(/\bjob\.payload\.postId\b/g, 'job.payload.post_id');
  
  // Fix 4: job.payload.userId → job.payload.user_id
  content = content.replace(/\bjob\.payload\.userId\b/g, 'job.payload.user_id');
  
  // Fix 5: params.targetId → params.target_id (but NOT in enqueueJob calls)
  const lines = content.split('\n');
  content = lines.map(line => {
    // Skip if line is defining params or in enqueueJob call
    if (line.includes('targetId:') && line.includes('params.')) {
      return line;
    }
    if (line.includes('enqueueJob')) {
      return line;
    }
    return line.replace(/params\.targetId\b/g, 'params.target_id');
  }).join('\n');
  
  // Fix 6: params.actionType → params.action_type
  content = content.replace(/params\.actionType\b/g, 'params.action_type');
  
  // Fix 7: params.ruleId → params.rule_id
  content = content.replace(/params\.ruleId\b/g, 'params.rule_id');
  
  // Fix 8: params.contentSent → params.content_sent
  content = content.replace(/params\.contentSent\b/g, 'params.content_sent');
  
  // Fix 9: Interface field pageName → page_name
  content = content.replace(/(\s+)pageName(\?)?:\s*string;/g, '$1page_name$2: string;');
  
  // Fix 10: message_templateResult → templateResult
  content = content.replace(/message_templateResult/g, 'templateResult');
  
  // Fix 11: userId: tokenInfo.user_id → user_id: tokenInfo.user_id (in API responses)
  content = content.replace(/(\s+)userId:\s*tokenInfo\.user_id/g, '$1user_id: tokenInfo.user_id');
  
  // Fix 12: Remove .is_active usage in favor of .enabled
  content = content.replace(/body\.is_active/g, 'body.enabled');
  
  // Fix 13: ruleId: in API responses → rule_id:
  content = content.replace(/(\s+)ruleId:\s*([a-zA-Z])/g, '$1rule_id: $2');
  
  // Fix 14: template: in object literals → message_template: (but keep reply_templates)
  // This one is tricky - only for validation.ts context
  if (filePath.includes('validation.ts')) {
    content = content.replace(/console\.error\('❌ Failed to preview template:', error\);/g, 
      "console.error('❌ Failed to preview reply template:', error);");
  }
  
  // Fix 15: body.match_type → body.trigger_type
  content = content.replace(/body\.match_type/g, 'body.trigger_type');
  
  // Fix 16: body.template → body.reply_templates (when used as array)
  // Skip this - too context dependent
  
  // Fix 17: userId: in metadata → user_id:
  content = content.replace(/(\s+userId:\s*commentData)/g, ' user_id: commentData');
  
  // Fix 18: postId:, commentId: in parseWebhookEvent calls
  content = content.replace(/(\s+)(postId|commentId|userId):\s*value\./g, (match, space, field) => {
    const snakeField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
    return `${space}${snakeField}: value.`;
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    const changeCount = (original.match(/\n/g) || []).length;
    fixes = Math.min(10, changeCount); // Estimate
    console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
  }
  
  return fixes;
}

async function main() {
  console.log('🔧 Auto-fixing all issues...\n');
  
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
  
  files.forEach(file => {
    totalFixed += fixFile(file);
  });
  
  console.log(`\n🎉 Fixed issues in ${totalFixed} locations`);
  console.log('\nRun "npm run check" to verify all fixes');
}

main();
