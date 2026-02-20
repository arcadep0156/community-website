'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Github, TrendingUp } from 'lucide-react';

interface Contributor {
  name: string;
  github: string;
  count: number;
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

  useEffect(() => {
    console.log('Fetching contributors from GitHub...');
    fetch('https://raw.githubusercontent.com/arcadep0156/interview-questions/main/contributors.json')
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          // Fallback to mock data for local testing
          console.warn('Using mock data for local testing');
          return {
            version: 'v1',
            lastUpdated: new Date().toISOString(),
            totalContributors: 3,
            contributors: [
              { name: 'Test User', github: '@testuser', count: 5 },
              { name: 'Demo Contributor', github: '@demo', count: 3 },
              { name: 'Sample User', github: '@sample', count: 2 },
            ]
          };
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
        // Use mock data on error
        setData({
          version: 'v1',
          lastUpdated: new Date().toISOString(),
          totalContributors: 3,
          contributors: [
            { name: 'Test User', github: '@testuser', count: 5 },
            { name: 'Demo Contributor', github: '@demo', count: 3 },
            { name: 'Sample User', github: '@sample', count: 2 },
          ]
        });
        setLoading(false);
      });
  }, []);

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

      {/* Top 3 Podium */}
      {data.contributors.length >= 3 && (
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {/* 2nd Place */}
          <div className="order-1 md:order-1">
            <div className={`card-neo-border ${getRankStyle(2)} relative overflow-hidden p-6 text-center transition-all hover:scale-105`}>
              <div className="absolute right-2 top-2 text-6xl font-bold opacity-10">2</div>
              <div className="relative z-10">
                <div className="mb-3 flex justify-center">{getMedalIcon(2)}</div>
                <h3 className="mb-2 text-xl font-bold">{data.contributors[1].name}</h3>
                <a
                  href={`https://github.com/${data.contributors[1].github.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                  {data.contributors[1].github}
                </a>
                <div className="text-3xl font-bold text-primary">{data.contributors[1].count}</div>
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
                <h3 className="mb-2 text-2xl font-bold">{data.contributors[0].name}</h3>
                <a
                  href={`https://github.com/${data.contributors[0].github.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                  {data.contributors[0].github}
                </a>
                <div className="text-4xl font-bold text-primary">{data.contributors[0].count}</div>
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
                <h3 className="mb-2 text-xl font-bold">{data.contributors[2].name}</h3>
                <a
                  href={`https://github.com/${data.contributors[2].github.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                  {data.contributors[2].github}
                </a>
                <div className="text-3xl font-bold text-primary">{data.contributors[2].count}</div>
                <p className="text-sm text-muted-foreground">questions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Contributors List */}
      {data.contributors.length > 3 && (
        <div>
          <h2 className="mb-6 text-center text-2xl font-bold">All Contributors</h2>
          <div className="space-y-3">
            {data.contributors.slice(3).map((contributor, index) => {
              const rank = index + 4;
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
                      <a
                        href={`https://github.com/${contributor.github.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                      >
                        <Github className="h-3 w-3" />
                        {contributor.github}
                      </a>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{contributor.count}</div>
                    <p className="text-xs text-muted-foreground">questions</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
