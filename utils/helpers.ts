import React from 'react';
import { Ratings, RatingCategory, CrowdEstimate, HypeLevel, RATING_CATEGORIES } from '../types';

export const calculateTimeLeft = (createdAt: Date) => {
  if (!createdAt || !(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }
  const now = new Date().getTime();
  const createdTime = createdAt.getTime();
  const expires = createdTime + 24 * 60 * 60 * 1000;
  const difference = expires - now;

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (difference > 0) {
    hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    minutes = Math.floor((difference / 1000 / 60) % 60);
    seconds = Math.floor((difference / 1000) % 60);
  }

  return { hours, minutes, seconds };
};

export const getHypeLevel = (ratings: Ratings) => {
    if (!ratings || !Array.isArray(ratings.hype)) {
        return { text: 'New', color: 'border border-brand-tertiary bg-brand-secondary text-brand-text-secondary' };
    }

    const validHypes = ratings.hype.filter(h => h && h.level);
    if (validHypes.length === 0) {
        return { text: 'New', color: 'border border-brand-tertiary bg-brand-secondary text-brand-text-secondary' };
    }

    const hypeCounts = validHypes.reduce((acc, curr) => {
        acc[curr.level] = (acc[curr.level] || 0) + 1;
        return acc;
    }, {} as Record<HypeLevel, number>);

    const dominantHype = Object.keys(hypeCounts).reduce((a, b) => hypeCounts[a as HypeLevel] > hypeCounts[b as HypeLevel] ? a : b) as HypeLevel;

    switch(dominantHype) {
        case 'run_here': return { text: 'Run here now!', color: 'border border-brand-neon bg-brand-neon/20 text-brand-neon' };
        case 'popping': return { text: 'Popping', color: 'border border-green-400/50 bg-green-500/20 text-green-300' };
        case 'good_vibe': return { text: 'Good Vibe', color: 'border border-teal-400/50 bg-teal-500/20 text-teal-300' };
        case 'chill': return { text: 'Chill', color: 'border border-blue-400/50 bg-blue-500/20 text-blue-300' };
        case 'save_yourself': return { text: 'Save yourself', color: 'border border-gray-400/50 bg-gray-500/20 text-gray-400' };
        default: return { text: 'New', color: 'border border-brand-tertiary bg-brand-secondary text-brand-text-secondary' };
    }
};

export const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return React.createElement('a', { key: i, href: part, target: '_blank', rel: 'noopener noreferrer', className: "text-brand-neon underline hover:opacity-80"}, part);
    }
    return part;
  });
};

export const getAverageRating = (ratings: number[]) => {
    if (!Array.isArray(ratings) || ratings.length === 0) return 0;
    const numericRatings = ratings.filter(r => typeof r === 'number');
    if (numericRatings.length === 0) return 0;
    return numericRatings.reduce((a, b) => a + b, 0) / numericRatings.length;
};

export const getOverallAverageRating = (ratings: Ratings): number => {
    if (!ratings || typeof ratings !== 'object') return 0;

    const categoryAverages = RATING_CATEGORIES
        .map(cat => getAverageRating(ratings[cat]))
        .filter(avg => avg > 0);
    
    if (categoryAverages.length === 0) return 0;
    
    return categoryAverages.reduce((a, b) => a + b, 0) / categoryAverages.length;
};


export const getTopRatedCategory = (ratings: Ratings): { name: RatingCategory, average: number } | null => {
    if (!ratings || typeof ratings !== 'object') return null;
    
    const allRatings = RATING_CATEGORIES.flatMap(c => ratings[c] || []);
    if (allRatings.length < 3) return null;

    let topCategory: RatingCategory | null = null;
    let maxAverage = 0;

    for (const category of RATING_CATEGORIES) {
        const average = getAverageRating(ratings[category]);
        if (average > maxAverage) {
            maxAverage = average;
            topCategory = category;
        }
    }

    return topCategory ? { name: topCategory, average: maxAverage } : null;
};

export const getAverageCrowdEstimate = (estimates: CrowdEstimate[]) => {
    if (!Array.isArray(estimates)) {
        return { average: 0, latest: null };
    }
    
    const validEstimates = estimates.filter(e => e && typeof e.estimate === 'number' && e.timestamp);
    if (validEstimates.length === 0) {
        return { average: 0, latest: null };
    }

    const sum = validEstimates.reduce((acc, curr) => acc + curr.estimate, 0);
    const average = sum / validEstimates.length;
    const latest = validEstimates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return { average, latest };
};


export const parseForEmbed = (text: string): string | undefined => {
    const urlRegex = /(https?:\/\/(?:www\.)?(instagram\.com\/p\/[a-zA-Z0-9_-]+|tiktok\.com\/@[a-zA-Z0-9_.]+\/video\/[0-9]+))/g;
    const match = urlRegex.exec(text);
    return match ? match[0] : undefined;
};