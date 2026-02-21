"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, AlertCircle, Download, RefreshCw, Loader2, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InterviewQuestionCard } from '@/components/interview/interview-question-card';
import { QuestionFilters, type FilterState } from '@/components/interview/question-filters';
import type { InterviewQuestion } from '@/services/github-json';
import { getAllInterviewQuestions, getFilterOptions } from '@/services/github-json';
import Fuse from 'fuse.js';

interface InterviewQuestionsNewClientProps {
  questions: InterviewQuestion[];
  filterOptions: {
    companies: string[];
    years: string[];
    roles: string[];
    experiences: string[];
    topics: string[];
    contributors: string[];
  };
}

const ITEMS_PER_PAGE = 10;
const INITIAL_COMPANIES_TO_SHOW = 5;

export function InterviewQuestionsNewClient({ 
  questions: initialQuestions, 
  filterOptions: initialFilterOptions 
}: InterviewQuestionsNewClientProps) {
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>(initialQuestions);
  const [filterOptions, setFilterOptions] = useState(initialFilterOptions);
  const [isLoading, setIsLoading] = useState(initialQuestions.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    company: '',
    year: '',
    role: '',
    experience: '',
    topic: '',
    contributor: '',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Lazy rendering state
  const [visibleCompaniesCount, setVisibleCompaniesCount] = useState(INITIAL_COMPANIES_TO_SHOW);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (allQuestions.length === 0) {
      loadQuestions();
    }
  }, []);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const fetchedQuestions = await getAllInterviewQuestions();
      setAllQuestions(fetchedQuestions);
      setFilterOptions(getFilterOptions(fetchedQuestions));
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadQuestions(),
      new Promise(resolve => setTimeout(resolve, 1000))
    ]);
    setIsRefreshing(false);
  };

  const fuse = useMemo(() => {
    return new Fuse(allQuestions, {
      keys: ['question', 'topic', 'company', 'role'],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [allQuestions]);

  const filteredQuestions = useMemo(() => {
    let result = allQuestions;

    if (filters.company) result = result.filter(q => q.company === filters.company);
    if (filters.year) result = result.filter(q => q.year === filters.year);
    if (filters.role) result = result.filter(q => q.role === filters.role);
    if (filters.experience) result = result.filter(q => q.experience === filters.experience);
    if (filters.topic) result = result.filter(q => q.topic === filters.topic);
    if (filters.contributor) {
      result = result.filter(q => {
        const contributorGithub = typeof q.contributor === 'string' 
          ? q.contributor 
          : q.contributor.github;
        return contributorGithub === filters.contributor;
      });
    }

    if (searchQuery.trim()) {
      const filteredFuse = new Fuse(result, {
        keys: ['question', 'topic', 'company', 'role'],
        threshold: 0.3,
        ignoreLocation: true,
      });
      result = filteredFuse.search(searchQuery).map(r => r.item);
    }

    return result;
  }, [allQuestions, filters, searchQuery]);

  const allQuestionsByCompany = useMemo(() => {
    const grouped: Record<string, InterviewQuestion[]> = {};
    filteredQuestions.forEach(q => {
      if (!grouped[q.company]) grouped[q.company] = [];
      grouped[q.company].push(q);
    });
    return grouped;
  }, [filteredQuestions]);

  const allCompanies = Object.keys(allQuestionsByCompany).sort();
  const visibleCompanies = allCompanies.slice(0, visibleCompaniesCount);
  const hasMoreCompanies = visibleCompaniesCount < allCompanies.length;

  // Get questions from visible companies only
  const visibleQuestions = useMemo(() => {
    return filteredQuestions.filter(q => visibleCompanies.includes(q.company));
  }, [filteredQuestions, visibleCompanies]);

  // Group visible questions by company - show ALL visible companies
  const questionsByCompany = useMemo(() => {
    const grouped: Record<string, InterviewQuestion[]> = {};
    visibleQuestions.forEach(q => {
      if (!grouped[q.company]) grouped[q.company] = [];
      grouped[q.company].push(q);
    });
    return grouped;
  }, [visibleQuestions]);

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  const loadMoreCompanies = useCallback(() => {
    setVisibleCompaniesCount(prev => Math.min(prev + 5, allCompanies.length));
  }, [allCompanies.length]);

  const toggleCompanyExpansion = useCallback((company: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(company)) {
        newSet.delete(company);
      } else {
        newSet.add(company);
      }
      return newSet;
    });
  }, []);

  const handleExport = () => {
    const csv = [
      ['Company', 'Year', 'Role', 'Experience', 'Topic', 'Question', 'Contributor', 'LinkedIn'].join(','),
      ...filteredQuestions.map(q => {
        const contributorName = typeof q.contributor === 'string' 
          ? q.contributor 
          : (q.contributor.name || q.contributor.github);
        const contributorLinkedIn = typeof q.contributor === 'string' 
          ? '' 
          : (q.contributor.linkedin || '');
        return [
          q.company, q.year, q.role, q.experience, q.topic, 
          `"${q.question.replace(/"/g, '""')}"`, 
          contributorName, contributorLinkedIn
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-questions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading questions...</span>
        </div>
      )}

      {!isLoading && (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">DevOps Interview Questions</h1>
            <p className="text-muted-foreground mt-1">
              Real questions from top tech companies, contributed by the community
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleManualRefresh} variant="outline" className="gap-2" disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button asChild variant="default" className="gap-2">
              <Link href="/contributors">
                <Award className="h-4 w-4" />
                Contributors
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg border">
            <div className="text-2xl font-bold text-primary">{allQuestions.length}</div>
            <div className="text-sm text-muted-foreground">Total Questions</div>
          </div>
          <div className="p-4 bg-primary/5 rounded-lg border">
            <div className="text-2xl font-bold text-primary">{filterOptions.companies.length}</div>
            <div className="text-sm text-muted-foreground">Companies</div>
          </div>
          <div className="p-4 bg-primary/5 rounded-lg border">
            <div className="text-2xl font-bold text-primary">{filterOptions.topics.length}</div>
            <div className="text-sm text-muted-foreground">Topics</div>
          </div>
          <div className="p-4 bg-primary/5 rounded-lg border">
            <div className="text-2xl font-bold text-primary">{visibleCompaniesCount}/{allCompanies.length}</div>
            <div className="text-sm text-muted-foreground">Companies Shown</div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search questions by keyword, topic, company, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      )}

      {!isLoading && (
      <>
      <QuestionFilters filters={filters} onFilterChange={setFilters} filterOptions={filterOptions} />

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <strong>{Object.keys(questionsByCompany).length}</strong> companies with <strong>{visibleQuestions.length}</strong> questions
            {hasMoreCompanies && (
              <span className="text-xs block mt-1">
                ({allCompanies.length - visibleCompaniesCount} more companies available)
              </span>
            )}
          </p>
          {hasMoreCompanies && (
            <Button onClick={loadMoreCompanies} variant="outline" size="sm">
              Show More Companies ({allCompanies.length - visibleCompaniesCount} hidden)
            </Button>
          )}
        </div>

        {visibleCompanies.length === 0 ? (
          <Alert variant="destructive" className="border-destructive bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive">No Results Found</AlertTitle>
            <AlertDescription className="text-destructive/90">
              {searchQuery
                ? `No questions match your search for "${searchQuery}". Try different keywords or clear filters.`
                : 'No questions match your selected filters. Try adjusting or clearing some filters.'}
              {hasMoreCompanies && ' You can also show more companies to see additional questions.'}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-6">
              {Object.entries(questionsByCompany).map(([company, questions]) => (
                <div key={company} className="border rounded-lg p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-accent/10 p-2 rounded-lg transition-colors"
                    onClick={() => toggleCompanyExpansion(company)}
                  >
                    <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                      {company}
                      <Badge variant="secondary">
                        {allQuestionsByCompany[company]?.length || questions.length} questions
                      </Badge>
                    </h2>
                    {expandedCompanies.has(company) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {expandedCompanies.has(company) ? (
                    <div className="mt-4 space-y-4">
                      {questions.map((question, index) => (
                        <InterviewQuestionCard
                          key={`${question.company}-${question.year}-${index}`}
                          question={question}
                          index={index}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic pl-2 mt-2">
                      Click to expand and view questions
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="text-foreground font-semibold">Want to Contribute?</AlertTitle>
        <AlertDescription className="text-foreground/80">
          Help the community by sharing interview questions you've encountered.{' '}
          <a
            href="https://github.com/TrainWithShubham/interview-questions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Submit a Pull Request on GitHub
          </a>
          {' '}with your questions in JSON format.
        </AlertDescription>
      </Alert>
      </>
      )}
    </div>
  );
}
