const fs = require('fs');
const schema = `// Prisma schema for TroLyPhapLy
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model AdminUser {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("admin_users")
}

model LegalDocument {
  id            String   @id @default(uuid())
  title         String
  docNumber     String?  @map("doc_number")
  type          String
  authority     String
  issueDate     DateTime @map("issue_date")
  effectiveDate DateTime @map("effective_date")
  summary       String?  @db.Text
  content       Json
  tags          String[]
  category      String
  status        String   @default("active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  @@map("legal_documents")
}

model Procedure {
  id        String   @id @default(uuid())
  title     String
  authority String
  timeEst   String   @map("time_est")
  category  String
  steps     Json
  documents Json
  fees      String?
  notes     String?  @db.Text
  tags      String[]
  status    String   @default("active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("procedures")
}

model Prompt {
  id        String   @id @default(uuid())
  title     String
  body      String   @db.Text
  category  String
  tags      String[]
  isPublic  Boolean  @default(true) @map("is_public")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("prompts")
}

model App {
  id             String   @id @default(uuid())
  slug           String   @unique
  name           String
  description    String?
  category       String   @default("other")
  status         String   @default("draft")
  type           String
  inputSchema    Json     @map("input_schema")
  promptTemplate String   @db.Text @map("prompt_template")
  outputSchema   Json?    @map("output_schema")
  renderConfig   Json?    @map("render_config")
  shareConfig    Json?    @map("share_config")
  limits         Json?
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  results        Result[]
  statsDaily     AppStatsDaily[]
  events         AppEvent[]
  @@map("apps")
}

model Result {
  id         String   @id @default(uuid())
  appId      String   @map("app_id")
  inputData  Json     @map("input_data")
  outputData Json?    @map("output_data")
  imageUrl   String?  @map("image_url")
  metadata   Json?
  createdAt  DateTime @default(now()) @map("created_at")
  app        App      @relation(fields: [appId], references: [id], onDelete: Cascade)
  events     AppEvent[]
  @@map("results")
}

model AppStatsDaily {
  appId           String   @map("app_id")
  date            DateTime @db.Date
  views           Int      @default(0)
  submits         Int      @default(0)
  shares          Int      @default(0)
  affiliateClicks Int      @default(0) @map("affiliate_clicks")
  app             App      @relation(fields: [appId], references: [id], onDelete: Cascade)
  @@id([appId, date])
  @@map("app_stats_daily")
}

model AppEvent {
  id        BigInt   @id @default(autoincrement())
  appId     String   @map("app_id")
  eventType String   @map("event_type")
  resultId  String?  @map("result_id")
  metadata  Json?
  createdAt DateTime @default(now()) @map("created_at")
  app       App      @relation(fields: [appId], references: [id], onDelete: Cascade)
  result    Result?  @relation(fields: [resultId], references: [id], onDelete: SetNull)
  @@map("app_events")
}
`;
fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log(' Schema created successfully');
