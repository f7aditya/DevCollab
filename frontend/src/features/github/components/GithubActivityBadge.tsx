import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GitPullRequest, CircleDot, GitMerge } from 'lucide-react';

interface GithubActivityBadgeProps {
  type: 'ISSUE' | 'PULL_REQUEST' | 'COMMIT';
  status: 'open' | 'closed' | 'merged' | 'draft';
  number: number;
}

export const GithubActivityBadge: React.FC<GithubActivityBadgeProps> = ({ type, status, number }) => {
  if (type === 'PULL_REQUEST') {
    if (status === 'merged') {
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1 px-2 py-0.5 text-xs">
          <GitMerge className="h-3 w-3" /> PR #{number} Merged
        </Badge>
      );
    }
    if (status === 'closed') {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 gap-1 px-2 py-0.5 text-xs">
          <GitPullRequest className="h-3 w-3" /> PR #{number} Closed
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1 px-2 py-0.5 text-xs">
        <GitPullRequest className="h-3 w-3" /> PR #{number} Open
      </Badge>
    );
  }

  if (type === 'ISSUE') {
    if (status === 'closed') {
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1 px-2 py-0.5 text-xs">
          <CircleDot className="h-3 w-3" /> Issue #{number} Closed
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1 px-2 py-0.5 text-xs">
        <CircleDot className="h-3 w-3" /> Issue #{number} Open
      </Badge>
    );
  }

  return null;
};
