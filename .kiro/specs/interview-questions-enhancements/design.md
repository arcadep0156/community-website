# Interview Questions Enhancements - Design

## Architecture Overview

The community website fetches interview questions from the interview-questions repository at build time, displays them with pagination, search, and filtering, and automatically rebuilds when new questions are added.

## Data Flow

```
1. Build time: Fetch from GitHub JSON
   ↓
2. Parse index.json and questions
   ↓
3. Server-side rendering (static export)
   ↓
4. Client-side state management
   ↓
5. Pagination, search, filtering
   ↓
6. Display with LinkedIn integration
```

## Components

### 1. Interview Questions Page

**File**: `src/app/interview-questions/interview-questions-client.tsx`

**State Management**:
```typescript
const [searchQuery, setSearchQuery] = useState('')
const [selectedCompany, setSelectedCompany] = useState('all')
const [selectedTopic, setSelectedTopic] = useState('all')
const [selectedExperience, setSelectedExperience] = useState('all')
const [selectedDifficulty, setSelectedDifficulty] = useState('all')
const [currentPage, setCurrentPage] = useState(1)
const questionsPerPage = 10
```

**Filtering Logic**:
```typescript
const filteredQuestions = useMemo(() => {
  return questions.filter(q => {
    const matchesSearch = searchQuery === '' || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.role.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCompany = selectedCompany === 'all' || q.company === selectedCompany
    const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic
    const matchesExperience = selectedExperience === 'all' || q.experience === selectedExperience
    const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCompany && matchesTopic && 
           matchesExperience && matchesDifficulty
  })
}, [questions, searchQuery, selectedCompany, selectedTopic, selectedExperience, selectedDifficulty])
```

**Pagination Logic**:
```typescript
const paginatedQuestions = useMemo(() => {
  const startIndex = (currentPage - 1) * questionsPerPage
  const endIndex = startIndex + questionsPerPage
  return filteredQuestions.slice(startIndex, endIndex)
}, [filteredQuestions, currentPage])

const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage)
```

**Reset on Filter Change**:
```typescript
useEffect(() => {
  setCurrentPage(1)
}, [searchQuery, selectedCompany, selectedTopic, selectedExperience, selectedDifficulty])
```

### 2. Interview Question Card

**File**: `src/components/interview/interview-question-card.tsx`

**LinkedIn Integration**:
```typescript
<div className="flex items-center gap-2 text-sm text-muted-foreground">
  <User className="h-4 w-4" />
  <span>{question.contributor.name}</span>
  {question.contributor.linkedin && (
    <>
      <span>|</span>
      <a 
        href={question.contributor.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        LinkedIn
      </a>
    </>
  )}
</div>
```

**Metadata with Pipe Separators**:
```typescript
<div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
  <span>{question.role}</span>
  <span>|</span>
  <span>{question.experience}</span>
  <span>|</span>
  <span>{question.contributor.name}</span>
  {question.contributor.linkedin && (
    <>
      <span>|</span>
      <a href={question.contributor.linkedin}>LinkedIn</a>
    </>
  )}
</div>
```

### 3. Contributors Page

**File**: `src/app/contributors/contributors-client.tsx`

**State Management**:
```typescript
const [searchQuery, setSearchQuery] = useState('')
const [currentPage, setCurrentPage] = useState(1)
const contributorsPerPage = 10
```

**Search Logic**:
```typescript
const filteredContributors = useMemo(() => {
  if (!searchQuery) return contributors
  
  return contributors.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.github.toLowerCase().includes(searchQuery.toLowerCase())
  )
}, [contributors, searchQuery])
```

**Podium and Pagination**:
```typescript
const topThree = filteredContributors.slice(0, 3)
const remaining = filteredContributors.slice(3)

const paginatedContributors = useMemo(() => {
  const startIndex = (currentPage - 1) * contributorsPerPage
  const endIndex = startIndex + contributorsPerPage
  return remaining.slice(startIndex, endIndex)
}, [remaining, currentPage])
```

**LinkedIn Display**:
```typescript
const renderSocialLinks = (contributor) => (
  <div className="flex items-center gap-2">
    <a href={`https://github.com/${contributor.github.replace('@', '')}`}>
      {contributor.github}
    </a>
    {contributor.linkedin && (
      <>
        <span>|</span>
        <a href={contributor.linkedin}>LinkedIn</a>
      </>
    )}
  </div>
)
```

### 4. Data Fetching

**File**: `src/lib/data-fetcher.ts`

**Fetch from GitHub**:
```typescript
export async function fetchInterviewQuestions() {
  const response = await fetch(
    'https://raw.githubusercontent.com/arcadep0156/interview-questions/main/index.json'
  )
  const data = await response.json()
  return data.questions
}

export async function fetchContributors() {
  const response = await fetch(
    'https://raw.githubusercontent.com/arcadep0156/interview-questions/main/contributors.json'
  )
  return await response.json()
}
```

## Automated Rebuild

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

**Triggers**:
```yaml
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 * * * *'  # Hourly
  workflow_dispatch:
  repository_dispatch:
    types: [interview-questions-updated]
```

**Build Steps**:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run `npm run build` (static export)
5. Deploy to GitHub Pages

### Webhook from Interview-Questions

**Source**: `interview-questions/.github/workflows/trigger-deploy.yml`

**Trigger**:
```yaml
on:
  push:
    branches: [main]
    paths:
      - 'data/**/*.json'
      - 'index.json'
```

**Action**:
```yaml
- name: Trigger website rebuild
  uses: peter-evans/repository-dispatch@v2
  with:
    token: ${{ secrets.TRIGGER_TOKEN }}
    repository: arcadep0156/community-website
    event-type: interview-questions-updated
```

## basePath Configuration

**File**: `next.config.ts`

**Conditional basePath**:
```typescript
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/community-website' : '',
  images: {
    unoptimized: true,
  },
}
```

**Usage**:
- Development: `http://localhost:3000/` (no basePath)
- GitHub Pages: `https://arcadep0156.github.io/community-website/`
- Custom Domain: Comment out basePath for `community.trainwithshubham.com`

## Experience Levels

- **Fresher**: Entry-level, no experience
- **0-2 years**: Junior level
- **3-5 years**: Mid-level
- **5+ years**: Senior level

## Pagination UI

**Controls**:
- Previous button (disabled on page 1)
- Page numbers (max 5 visible)
- Next button (disabled on last page)
- Current page highlighted

**Styling**:
```typescript
<button
  disabled={currentPage === 1}
  className="px-4 py-2 border rounded disabled:opacity-50"
>
  Previous
</button>

{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
  <button
    key={page}
    onClick={() => setCurrentPage(page)}
    className={cn(
      "px-4 py-2 border rounded",
      currentPage === page && "bg-primary text-primary-foreground"
    )}
  >
    {page}
  </button>
))}

<button
  disabled={currentPage === totalPages}
  className="px-4 py-2 border rounded disabled:opacity-50"
>
  Next
</button>
```

## Benefits

### For Users
- Easy navigation with pagination
- Quick search and filtering
- Professional networking via LinkedIn
- Fresh content automatically
- Entry-level questions available

### For Contributors
- Recognition with LinkedIn profiles
- Professional networking opportunities
- Automatic updates

### For Maintainers
- Automated rebuild process
- No manual deployment
- Clean component structure
- Type-safe implementation

## Migration Notes

### After Transfer to TrainWithShubham
1. Update repository URLs in workflows
2. Update data fetching URLs
3. Comment out basePath for custom domain
4. Update CNAME to community.trainwithshubham.com
5. Update secrets (TRIGGER_TOKEN)
