'use client';

import { useEffect, useState, useMemo } from 'react';
import { Trophy, Medal, Award, Github, TrendingUp, Search, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Contributor {
  name: string;
  github: string;
  count: number;
  linkedin?: string;
}

interface ContributorsData {
  version: string;
  lastUpdated: string;
  totalContributors: number;
  contributors: Contributor[];
}

export function ContributorsClient() {
  const [data, setData] = useState<ContributorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const contributorsPerPage = 10;

  const getMockData = (): ContributorsData => ({
    version: 'v1',
    lastUpdated: new Date().toISOString(),
    totalContributors: 3,
    contributors: [
      { name: 'Test User', github: '@testuser', count: 5 },
      { name: 'Demo Contributor', github: '@demo', count: 3 },
      { name: 'Sample User', github: '@sample', count: 2 },
    ]
  });

  useEffect(() => {
    console.log('Fetching contributors from GitHub...');
    fetch('https://raw.githubusercontent.com/arcadep0156/interview-questions/main/contributors.json')
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          console.warn('Using mock data for local testing');
          return getMockData();
        }
        return res.json();
      })
      .then(data => {
        console.log('Contributors data:', data);
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching contributors:', err);
        setData(getMockData());
        setLoading(false);
      });
  }, []);

  // Filter contributors based on search (must be before early returns)
  const filteredContributors = useMemo(() => {
    if (!data?.contributors) return [];
    if (!searchQuery.trim()) return data.contributors;
    
    const query = searchQuery.toLowerCase();
    const filtered = data.contributors.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.github.toLowerCase().includes(query)
    );
    console.log('Search query:', query, 'Results:', filtered.length);
    return filtered;
  }, [data?.contributors, searchQuery]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading contributors...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-destructive">Failed to load contributors. Please try again later.</p>
      </div>
    );
  }

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-8 w-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-8 w-8 text-gray-400" />;
    if (rank === 3) return <Award className="h-8 w-8 text-orange-600" />;
    return <TrendingUp className="h-6 w-6 text-muted-foreground" />;
  };

  const renderSocialLinks = (contributor: Contributor, size: 'sm' | 'md' = 'sm') => {
    const iconClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex items-center gap-2">
        <a
          href={`https://github.com/${contributor.github.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <Github className={iconClass} />
          {contributor.github}
        </a>
        {contributor.linkedin && (
          <>
            <span className="text-muted-foreground">|</span>
            <a
              href={contributor.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              LinkedIn
            </a>
          </>
        )}
      </div>
    );
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/50';
    return 'bg-card border-border';
  };

  const getTextStyle = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 dark:text-yellow-400';
    if (rank === 2) return 'text-gray-600 dark:text-gray-400';
    if (rank === 3) return 'text-orange-600 dark:text-orange-400';
    return 'text-muted-foreground';
  };

  return (
    <div>
      {/* Summary Stats */}
      <div className="mb-8 text-center">
        <p className="text-lg text-muted-foreground">
          <span className="font-bold text-primary">{data.totalContributors}</span> amazing contributors have shared{' '}
          <span className="font-bold text-accent">{data.contributors.reduce((sum, c) => sum + c.count, 0)}</span> interview questions
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date(data.lastUpdated).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search contributors by name or GitHub..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Top 3 Podium */}
      {!searchQuery && filteredContributors.length >= 3 && (
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {/* 2nd Place */}
          <div className="order-1 md:order-1">
            <div className={`card-neo-border ${getRankStyle(2)} relative overflow-hidden p-6 text-center transition-all hover:scale-105`}>
              <div className="absolute right-2 top-2 text-6xl font-bold opacity-10">2</div>
              <div className="relative z-10">
                <div className="mb-3 flex justify-center">{getMedalIcon(2)}</div>
                <h3 className="mb-2 text-xl font-bold">{filteredContributors[1].name}</h3>
                <div className="mb-3 flex justify-center gap-2">
                  {renderSocialLinks(filteredContributors[1], 'md')}
                </div>
                <div className="text-3xl font-bold text-primary">{filteredContributors[1].count}</div>
                <p className="text-sm text-muted-foreground">questions</p>
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="order-2 md:order-2">
            <div className={`card-neo-border ${getRankStyle(1)} relative overflow-hidden p-8 text-center transition-all hover:scale-105`}>
              <div className="absolute right-2 top-2 text-7xl font-bold opacity-10">1</div>
              <div className="relative z-10">
                <div className="mb-4 flex justify-center">{getMedalIcon(1)}</div>
                <div className="mb-2 inline-block rounded-full bg-yellow-500/20 px-4 py-1 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                  🏆 TOP CONTRIBUTOR
                </div>
                <h3 className="mb-2 text-2xl font-bold">{filteredContributors[0].name}</h3>
                <div className="mb-4 flex justify-center gap-2">
                  {renderSocialLinks(filteredContributors[0], 'md')}
                </div>
                <div className="text-4xl font-bold text-primary">{filteredContributors[0].count}</div>
                <p className="text-sm text-muted-foreground">questions</p>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 md:order-3">
            <div className={`card-neo-border ${getRankStyle(3)} relative overflow-hidden p-6 text-center transition-all hover:scale-105`}>
              <div className="absolute right-2 top-2 text-6xl font-bold opacity-10">3</div>
              <div className="relative z-10">
                <div className="mb-3 flex justify-center">{getMedalIcon(3)}</div>
                <h3 className="mb-2 text-xl font-bold">{filteredContributors[2].name}</h3>
                <div className="mb-3 flex justify-center gap-2">
                  {renderSocialLinks(filteredContributors[2], 'md')}
                </div>
                <div className="text-3xl font-bold text-primary">{filteredContributors[2].count}</div>
                <p className="text-sm text-muted-foreground">questions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searchQuery && filteredContributors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">No contributors found</p>
          <p className="text-sm text-muted-foreground">
            Try searching with a different name or GitHub username
          </p>
        </div>
      )}

      {/* All Contributors List */}
      {filteredContributors.length > 0 && (searchQuery || filteredContributors.length > 3) && (
        <div>
          <h2 className="mb-6 text-center text-2xl font-bold">
            {searchQuery ? `Search Results (${filteredContributors.length})` : 'All Contributors'}
          </h2>
          <div className="space-y-3">
            {(() => {
              const displayContributors = searchQuery ? filteredContributors : filteredContributors.slice(3);
              const totalPages = Math.ceil(displayContributors.length / contributorsPerPage);
              const startIndex = (currentPage - 1) * contributorsPerPage;
              const endIndex = startIndex + contributorsPerPage;
              const paginatedContributors = displayContributors.slice(startIndex, endIndex);

              return (
                <>
                  {paginatedContributors.map((contributor, index) => {
                    const actualIndex = searchQuery ? 
                      filteredContributors.indexOf(contributor) : 
                      startIndex + index + 3;
                    const rank = actualIndex + 1;
                    return (
                      <div
                        key={contributor.github}
                        className={`card-neo-border ${getRankStyle(rank)} flex items-center justify-between p-4 transition-all hover:scale-[1.02]`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <span className={`text-lg font-bold ${getTextStyle(rank)}`}>#{rank}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{contributor.name}</h3>
                            {renderSocialLinks(contributor, 'sm')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{contributor.count}</div>
                          <p className="text-xs text-muted-foreground">questions</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
