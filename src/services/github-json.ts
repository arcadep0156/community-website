/**
 * Service to fetch interview questions from GitHub JSON files
 * Replaces CSV with scalable JSON-based structure
 */

export interface Contributor {
  name?: string;
  github: string;
  linkedin?: string;
}

export interface InterviewQuestion {
  id?: string;
  company: string;
  year: string;
  role: string;
  experience: string;
  topic: string;
  question: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  contributor: string | Contributor;
  contributedAt?: string;
  tags?: string[];
}

export interface QuestionFile {
  path: string;
  company: string;
  year: string;
  count: number;
  topics: string[];
  sha256?: string;
}

export interface IndexData {
  version: string;
  lastUpdated: string;
  totalQuestions: number;
  files: QuestionFile[];
  metadata: {
    companies: string[];
    years: string[];
    topics: string[];
  };
}

interface CompanyQuestions {
  company: string;
  year: string;
  questions: Omit<InterviewQuestion, 'company' | 'year'>[];
}

// GitHub repository configuration
const GITHUB_OWNER = process.env.NEXT_PUBLIC_INTERVIEW_REPO_OWNER || 'arcadep0156';
const GITHUB_REPO = process.env.NEXT_PUBLIC_INTERVIEW_REPO_NAME || 'interview-questions';
const GITHUB_BRANCH = process.env.NEXT_PUBLIC_INTERVIEW_REPO_BRANCH || 'main';
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

// Cache configuration
const CACHE_DURATION = 3600; // 1 hour in seconds
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Fetch JSON from GitHub with caching
 */
async function fetchGitHubJSON<T>(path: string): Promise<T> {
  const url = `${GITHUB_RAW_BASE}/${path}`;
  const cacheKey = url;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION * 1000) {
    return cached.data as T;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TWS-Community-Hub/2.0',
        'Accept': 'application/json',
      },
      next: { revalidate: CACHE_DURATION },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${path}`);
      }
      if (response.status === 429) {
        throw new Error('GitHub rate limit exceeded');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Update cache
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    console.log(`✅ Loaded JSON from GitHub: ${path}`);
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout: ${path}`);
      }
      throw error;
    }
    throw new Error('Unknown error while fetching JSON');
  }
}

/**
 * Get the master index file
 */
export async function getIndex(): Promise<IndexData> {
  try {
    return await fetchGitHubJSON<IndexData>('index.json');
  } catch (error) {
    console.error('Error fetching index:', error);
    throw error;
  }
}

/**
 * Get questions for a specific company and year
 */
export async function getCompanyQuestions(year: string, company: string): Promise<InterviewQuestion[]> {
  try {
    const data = await fetchGitHubJSON<CompanyQuestions>(`data/${year}/${company}.json`);
    
    // Transform to include company and year in each question
    return data.questions.map(q => ({
      ...q,
      company: data.company,
      year: data.year,
    }));
  } catch (error) {
    console.error(`Error fetching questions for ${company} ${year}:`, error);
    return [];
  }
}

/**
 * Get all interview questions (loads all files)
 * Use this for initial page load or when filters require all data
 */
export async function getAllInterviewQuestions(): Promise<InterviewQuestion[]> {
  try {
    const index = await getIndex();
    
    // Fetch all company files in parallel
    const allQuestions = await Promise.all(
      index.files.map(file => {
        const [, year, companyFile] = file.path.split('/');
        const company = companyFile.replace('.json', '');
        return getCompanyQuestions(year, company);
      })
    );
    
    return allQuestions.flat();
  } catch (error) {
    console.error('Error fetching all questions:', error);
    return [];
  }
}

/**
 * Get questions filtered by year
 * More efficient than loading all questions
 */
export async function getQuestionsByYear(year: string): Promise<InterviewQuestion[]> {
  try {
    const index = await getIndex();
    const yearFiles = index.files.filter(f => f.year === year);
    
    const questions = await Promise.all(
      yearFiles.map(file => {
        const company = file.path.split('/').pop()?.replace('.json', '') || '';
        return getCompanyQuestions(year, company);
      })
    );
    
    return questions.flat();
  } catch (error) {
    console.error(`Error fetching questions for year ${year}:`, error);
    return [];
  }
}

/**
 * Get questions filtered by company (across all years)
 */
export async function getQuestionsByCompany(company: string): Promise<InterviewQuestion[]> {
  try {
    const index = await getIndex();
    const companyFiles = index.files.filter(f => f.company === company);
    
    const questions = await Promise.all(
      companyFiles.map(file => {
        return getCompanyQuestions(file.year, company);
      })
    );
    
    return questions.flat();
  } catch (error) {
    console.error(`Error fetching questions for ${company}:`, error);
    return [];
  }
}

/**
 * Get filter options from index (fast, no need to load all questions)
 */
export async function getFilterOptionsFromIndex() {
  try {
    const index = await getIndex();
    return {
      companies: index.metadata.companies.sort(),
      years: index.metadata.years.sort().reverse(),
      topics: index.metadata.topics.sort(),
      totalQuestions: index.totalQuestions,
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return {
      companies: [],
      years: [],
      topics: [],
      totalQuestions: 0,
    };
  }
}

/**
 * Get unique filter values from questions
 * Use when you already have questions loaded
 */
export function getFilterOptions(questions: InterviewQuestion[]) {
  return {
    companies: [...new Set(questions.map(q => q.company))].sort(),
    years: [...new Set(questions.map(q => q.year))].sort().reverse(),
    roles: [...new Set(questions.map(q => q.role))].sort(),
    experiences: [...new Set(questions.map(q => q.experience))].sort(),
    topics: [...new Set(questions.map(q => q.topic))].sort(),
    contributors: [...new Set(questions.map(q => 
      typeof q.contributor === 'string' ? q.contributor : q.contributor.github
    ))].sort(),
    difficulties: [...new Set(questions.map(q => q.difficulty).filter(Boolean))].sort() as string[],
  };
}

/**
 * Clear cache (useful for manual refresh)
 */
export function clearCache() {
  cache.clear();
}
