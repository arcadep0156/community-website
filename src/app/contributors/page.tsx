import { Metadata } from 'next';
import { Trophy, Award, Medal, Star } from 'lucide-react';
import { ContributorsClient } from './contributors-client';

export const metadata: Metadata = {
  title: 'Contributors Leaderboard | TrainWithShubham',
  description: 'Celebrating our amazing contributors who share real interview questions from top tech companies. Join the community and contribute your interview experiences!',
  keywords: ['contributors', 'leaderboard', 'interview questions', 'devops', 'community', 'trainwithshubham'],
  openGraph: {
    title: 'Contributors Leaderboard | TrainWithShubham',
    description: 'Celebrating our amazing contributors who share real interview questions from top tech companies.',
    type: 'website',
  },
};

export default function ContributorsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Trophy className="h-20 w-20 text-primary animate-pulse" />
            <Star className="absolute -right-2 -top-2 h-8 w-8 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="brand-gradient">Contributors Leaderboard</span>
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground sm:text-xl">
          Celebrating our amazing community members who share real interview questions 
          from top tech companies. Every contribution helps thousands of developers prepare better!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-neo-border bg-card p-6 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-primary" />
          <div className="text-3xl font-bold text-primary">Top Contributors</div>
          <p className="text-sm text-muted-foreground">Leading the way</p>
        </div>
        <div className="card-neo-border bg-card p-6 text-center">
          <Award className="mx-auto mb-3 h-10 w-10 text-yellow-500" />
          <div className="text-3xl font-bold text-yellow-500">Quality First</div>
          <p className="text-sm text-muted-foreground">Real experiences</p>
        </div>
        <div className="card-neo-border bg-card p-6 text-center">
          <Medal className="mx-auto mb-3 h-10 w-10 text-accent" />
          <div className="text-3xl font-bold text-accent">Community Driven</div>
          <p className="text-sm text-muted-foreground">Built together</p>
        </div>
        <div className="card-neo-border bg-card p-6 text-center">
          <Star className="mx-auto mb-3 h-10 w-10 text-orange-500" />
          <div className="text-3xl font-bold text-orange-500">Open Source</div>
          <p className="text-sm text-muted-foreground">Free forever</p>
        </div>
      </div>

      {/* Leaderboard */}
      <ContributorsClient />

      {/* Call to Action */}
      <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-8 text-center">
        <h2 className="mb-4 text-3xl font-bold">Want to see your name here?</h2>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
          Share your interview experiences and help the community! Every question you contribute 
          makes a difference in someone's career journey.
        </p>
        <a
          href="https://github.com/arcadep0156/interview-questions"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
        >
          <Trophy className="h-5 w-5" />
          Start Contributing
        </a>
      </div>
    </div>
  );
}
