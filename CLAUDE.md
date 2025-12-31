# UIGen Codebase Summary

**Generated:** Tuesday, 2025-12-30 18:11:25

---

## Project Overview

**UIGen** is an AI-powered React component generator with live preview capabilities. It allows users to describe components in natural language and generates working React code using Claude AI.

### Key Statistics
- **Total Files:** 73 TypeScript/JavaScript/JSX files
- **Database:** SQLite with Prisma ORM
- **AI Model:** Claude Haiku 4.5 (Anthropic)
- **Framework:** Next.js 15 with App Router
- **React Version:** 19
- **Code Quality:** Clean (no TODOs, FIXMEs, or technical debt markers)

---

## Architecture

### Core Components

#### 1. **Chat System** (`src/components/chat/`, `src/lib/contexts/chat-context.tsx`)
- Real-time chat interface for interacting with Claude
- Message history with markdown rendering
- Streaming responses using Vercel AI SDK
- Automatic project persistence for authenticated users

#### 2. **Virtual File System** (`src/lib/file-system.ts`, `src/lib/contexts/file-system-context.tsx`)
- In-memory file management (no disk writes during development)
- Serialization/deserialization for persistence
- Support for nested directories
- File operations: create, read, update, delete, rename, move

#### 3. **Live Preview System** (`src/components/preview/PreviewFrame.tsx`, `src/lib/transform/jsx-transformer.ts`)
- Real-time JSX/TSX rendering using Babel transformation
- Dynamic import maps for module resolution
- Sandboxed iframe execution
- Auto-detection of entry points (App.jsx, index.jsx, etc.)
- CSS injection support

#### 4. **Code Editor** (`src/components/editor/`)
- Monaco Editor integration
- Syntax highlighting for JS/JSX/TS/TSX/CSS/JSON/HTML/MD
- File tree navigation
- Real-time file content updates

#### 5. **Authentication System** (`src/lib/auth.ts`, `src/actions/`)
- JWT-based session management
- Optional anonymous mode
- Bcrypt password hashing
- Anonymous work tracking (preserves work for unauthenticated users)

#### 6. **AI Integration** (`src/app/api/chat/route.ts`, `src/lib/provider.ts`)
- Anthropic Claude API integration
- Mock provider for development without API key
- Prompt caching for cost efficiency
- Tool use capabilities (file management, code editing)

---

## AI Tools & Capabilities

### Current AI Tools

#### 1. **str_replace_editor** (`src/lib/tools/str-replace.ts`)
Commands:
- `view` - View file contents with optional range
- `create` - Create new files
- `str_replace` - Replace text in files
- `insert` - Insert text at specific line
- `undo_edit` - Not supported (use str_replace instead)

#### 2. **file_manager** (`src/lib/tools/file-manager.ts`)
Commands:
- `rename` - Rename or move files/folders
- `delete` - Delete files or directories

### AI Configuration

**System Prompt** (`src/lib/prompts/generation.tsx`):
- Optimized for React component generation
- Emphasizes Tailwind CSS usage
- Enforces `/App.jsx` as entry point
- Uses `@/` import alias for local files
- Brief, concise responses

**Model Settings:**
- Model: `claude-haiku-4-5`
- Max Tokens: 10,000
- Max Steps: 40 (4 for mock provider)
- Timeout: 120 seconds
- Caching: Ephemeral prompt caching enabled

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15.3.3 (App Router)
- **React:** 19.0.0
- **TypeScript:** 5.x
- **Styling:** Tailwind CSS v4 with @tailwindcss/typography
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Editor:** Monaco Editor (@monaco-editor/react)
- **Code Transform:** Babel Standalone

### Backend
- **API:** Next.js API Routes
- **Database:** SQLite (via Prisma)
- **ORM:** Prisma 6.10.1
- **Auth:** JWT (jose library)
- **Password:** bcrypt 6.0.0

### AI/ML
- **Provider:** Anthropic via @ai-sdk/anthropic
- **SDK:** Vercel AI SDK (ai 4.3.16)

### Testing
- **Framework:** Vitest 3.2.4
- **Testing Library:** @testing-library/react 16.3.0
- **DOM Testing:** @testing-library/dom 10.4.0
- **Environment:** jsdom 26.1.0

### Development
- **Linting:** ESLint 9.29.0 with Next.js config
- **Dev Server:** Turbopack enabled

---

## Database Schema

**Source of Truth:** `prisma/schema.prisma`

The database schema is defined using Prisma ORM with SQLite as the database provider. Always refer to `prisma/schema.prisma` for the authoritative database structure.

### Configuration

**Generator:**
- Provider: `prisma-client-js`
- Output: `../src/generated/prisma` (custom Prisma client location)

**Datasource:**
- Provider: `sqlite`
- Database file: `prisma/dev.db`

### Models

#### **User Model**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  projects  Project[]
}
```

**Fields:**
- `id` - String (CUID), Primary Key, auto-generated
- `email` - String, unique constraint (for login)
- `password` - String (bcrypt hashed, 10 rounds)
- `createdAt` - DateTime, auto-set on creation
- `updatedAt` - DateTime, auto-updated on modification
- `projects` - Relation to Project model (one-to-many)

#### **Project Model**
```prisma
model Project {
  id        String   @id @default(cuid())
  name      String
  userId    String?
  messages  String   @default("[]")
  data      String   @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Fields:**
- `id` - String (CUID), Primary Key, auto-generated
- `name` - String, project display name
- `userId` - String (nullable), foreign key to User
- `messages` - String (JSON serialized array), chat history, defaults to `"[]"`
- `data` - String (JSON serialized object), file system state, defaults to `"{}"`
- `createdAt` - DateTime, auto-set on creation
- `updatedAt` - DateTime, auto-updated on modification
- `user` - Relation to User model (many-to-one, optional)

**Relationships:**
- `userId` is optional (nullable) to support anonymous projects
- `onDelete: Cascade` - Deleting a user deletes all their projects
- Projects without `userId` represent anonymous user work

### Key Design Decisions

1. **CUID over UUID** - Uses `cuid()` for shorter, more URL-friendly IDs
2. **JSON Serialization** - `messages` and `data` stored as JSON strings in SQLite
3. **Optional User Relation** - Projects can exist without a user (anonymous mode)
4. **Cascade Delete** - User deletion automatically cleans up projects
5. **Default Values** - Empty arrays/objects prevent null handling complexity

---

## File Structure

```
src/
├── actions/                    # Server actions
│   ├── create-project.ts
│   ├── get-project.ts
│   ├── get-projects.ts
│   └── index.ts               # Auth actions
├── app/                       # Next.js App Router
│   ├── [projectId]/          # Dynamic project routes
│   ├── api/chat/             # Chat API endpoint
│   ├── layout.tsx
│   ├── main-content.tsx      # Main UI layout
│   └── page.tsx
├── components/
│   ├── auth/                 # Auth dialogs & forms
│   ├── chat/                 # Chat interface components
│   ├── editor/               # Code editor & file tree
│   ├── preview/              # Preview iframe
│   └── ui/                   # Radix UI components
├── hooks/
│   └── use-auth.ts
├── lib/
│   ├── contexts/             # React contexts
│   ├── prompts/              # AI prompts
│   ├── tools/                # AI tools
│   ├── transform/            # JSX transformation
│   ├── anon-work-tracker.ts  # Anonymous session tracking
│   ├── auth.ts               # JWT authentication
│   ├── file-system.ts        # Virtual file system
│   ├── prisma.ts             # Prisma client
│   ├── provider.ts           # AI model provider
│   └── utils.ts              # Utilities
└── middleware.ts             # Next.js middleware
```

---

## Key Features

### 1. **AI-Powered Generation**
- Natural language to React components
- Streaming responses for real-time feedback
- Tool use for file manipulation
- Context-aware code generation

### 2. **Live Preview**
- Real-time rendering of generated components
- Babel transformation pipeline
- Import map resolution
- Sandboxed execution environment

### 3. **Project Management**
- Save/load projects for authenticated users
- Anonymous work preservation
- Automatic project creation
- Message history persistence

### 4. **Development Experience**
- Monaco editor with syntax highlighting
- File tree navigation
- Split view (Preview/Code)
- Resizable panels

### 5. **Flexible Authentication**
- Optional sign-up/sign-in
- Anonymous usage support
- Work migration on sign-up
- Secure password handling

---

## Testing Coverage

### Tested Components
- `ChatInterface` - Chat UI and interactions
- `MarkdownRenderer` - Markdown rendering
- `MessageInput` - Input handling
- `MessageList` - Message display
- `FileTree` - File navigation
- `chat-context` - Chat state management
- `file-system-context` - File system state
- `file-system` - Core file operations
- `jsx-transformer` - Code transformation

### Test Framework
- Vitest with React Testing Library
- User event simulation
- Component rendering tests
- Context provider tests
- Integration tests

---

## Environment Configuration

### Required Variables
```bash
# Optional - app works without it using mock provider
ANTHROPIC_API_KEY=your-api-key-here
```

### Setup Commands
```bash
npm run setup        # Install deps + generate Prisma + migrate DB
npm run dev          # Start dev server with Turbopack
npm run dev:daemon   # Start dev server in background
npm run build        # Production build
npm run test         # Run tests
npm run db:reset     # Reset database
```

---

## Opportunities for Claude-Powered Features

### High-Priority Additions

#### 1. **Code Review Assistant**
- Analyze generated code for best practices
- Performance optimization suggestions
- Accessibility compliance checks
- Security vulnerability detection

#### 2. **Test Generator**
- Auto-generate Vitest tests for components
- Match existing test patterns
- Cover edge cases and user interactions

#### 3. **Documentation Generator**
- Create README files
- Generate JSDoc comments
- PropTypes/TypeScript interface docs
- Usage examples

#### 4. **Accessibility Auditor**
- WCAG compliance checks
- ARIA label suggestions
- Keyboard navigation improvements
- Screen reader compatibility

#### 5. **Style Refactoring Tool**
- Convert inline styles to Tailwind
- Optimize Tailwind class usage
- Extract common patterns
- Theme variant generation

#### 6. **Component Variant Generator**
- Dark mode versions
- Responsive layouts
- Size variants
- Theme variations

#### 7. **Export/Package Tool**
- NPM-ready package creation
- CodeSandbox link generation
- Shareable snippets
- Dependency bundling

#### 8. **Smart Completion**
- Context-aware suggestions
- Component prop auto-complete
- Related component recommendations
- Predictive code blocks

---

## Security Considerations

### Current Implementations
- ✅ Password hashing with bcrypt
- ✅ JWT session tokens with expiry
- ✅ Sandboxed iframe preview execution
- ✅ Server-side authentication checks
- ✅ Prisma parameterized queries (SQL injection protection)

### Areas for Enhancement
- Rate limiting on API endpoints
- CSRF protection
- Content Security Policy headers
- Input sanitization for user-generated content

---

## Performance Optimizations

### Current Optimizations
- Prompt caching (Anthropic ephemeral cache)
- Virtual file system (no disk I/O)
- Mock provider for development
- Turbopack for faster builds
- Automatic layout in Monaco editor

### Potential Improvements
- React Server Components for auth pages
- Edge runtime for API routes
- Code splitting for large generated apps
- Service worker for offline capability
- Debounced preview updates

---

## Conclusion

UIGen is a well-architected, production-ready application with:
- Clean, maintainable codebase
- Comprehensive testing
- Modern tech stack
- Flexible authentication
- Real-time AI integration
- Strong separation of concerns

The architecture is extensible and ready for additional Claude-powered features. The virtual file system and tool-based approach make it easy to add new AI capabilities without major refactoring.

**Recommended Next Steps:**
1. Implement Code Review Assistant tool
2. Add automated test generation
3. Create documentation generator
4. Enhance accessibility features
5. Add component variant generation

---

**Document Version:** 1.0  
**Generated by:** Rovo Dev AI Assistant  
**Project:** UIGen - AI-Powered React Component Generator
