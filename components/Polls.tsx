import React, { useState } from 'react';
import { Poll, User } from '../types';
import CreatePollForm from './CreatePollForm';
import { PlusIcon } from './Icons';
import TranslatedText from './TranslatedText';
import { useLanguage } from '../contexts/LanguageContext';

interface PollsProps {
  polls: Poll[];
  currentUser: User;
  isUserCheckedIn: boolean;
  onVote: (pollId: string, option: string) => void;
  onCreatePoll: (question: string, options: string[]) => void;
}

const Polls: React.FC<PollsProps> = ({ polls, currentUser, isUserCheckedIn, onVote, onCreatePoll }) => {
  const [isCreating, setIsCreating] = useState(false);
  const { t } = useLanguage();
  
  const handleCreate = (question: string, options: string[]) => {
      onCreatePoll(question, options);
      setIsCreating(false);
  };
  
  if (polls.length === 0 && !isCreating) {
    return (
        <div className="text-center py-8">
            <p className="text-brand-text-secondary">{t('noActivePolls', 'No active polls right now.')}</p>
             {isUserCheckedIn && (
                 <button onClick={() => setIsCreating(true)} className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-brand-neon text-brand-primary rounded-full text-sm font-semibold hover:scale-105 transition-transform">
                    <PlusIcon className="w-5 h-5" />
                    {t('createPoll', 'Create a Poll')}
                </button>
            )}
        </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {!isUserCheckedIn && (
        <p className="text-center text-sm text-yellow-400 p-2 bg-yellow-400/10 rounded-md">
            {t('checkInToVotePolls', 'You must be checked in to vote or create polls.')}
        </p>
      )}

      {isCreating ? (
          <CreatePollForm onCreate={handleCreate} onCancel={() => setIsCreating(false)} />
      ) : (
          isUserCheckedIn && (
            <div className="text-right">
              <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 ml-auto px-4 py-2 bg-brand-secondary hover:bg-brand-tertiary rounded-full text-brand-neon transition-colors text-sm font-semibold">
                  <PlusIcon className="w-5 h-5" />
                  <span>{t('createPoll', 'Create a Poll')}</span>
              </button>
            </div>
          )
      )}

      {polls.slice().reverse().map(poll => <PollItem key={poll.id} poll={poll} onVote={onVote} currentUser={currentUser} canVote={isUserCheckedIn} />)}
    </div>
  );
};

interface PollItemProps {
    poll: Poll;
    currentUser: User;
    canVote: boolean;
    onVote: (pollId: string, option: string) => void;
}

const PollItem: React.FC<PollItemProps> = ({ poll, currentUser, canVote, onVote }) => {
  // Fix for error on line 74: Operator '+' cannot be applied to types 'unknown' and 'number'.
  const totalVotes = Object.values(poll.options).reduce((sum, count) => sum + (count as number), 0);
  const userVote = poll.voters[currentUser.id];
  const { t } = useLanguage();

  return (
    <div className="bg-brand-tertiary/50 p-4 rounded-lg">
      <h4 className="font-bold text-lg text-white mb-3"><TranslatedText>{poll.question}</TranslatedText></h4>
      <div className="space-y-2">
        {Object.entries(poll.options).map(([option, votes]) => {
          // Fix for errors on line 84: Operator '>' cannot be applied and right-hand side of arithmetic must be number.
          const percentage = totalVotes > 0 ? (((votes as number) / totalVotes) * 100) : 0;
          const hasVotedForThis = userVote === option;

          return (
            <button
              key={option}
              onClick={() => onVote(poll.id, option)}
              className={`w-full text-left p-3 rounded-md relative overflow-hidden transition-transform hover:scale-[1.02] disabled:cursor-not-allowed ${userVote ? '' : 'bg-brand-tertiary'} ${hasVotedForThis ? 'ring-2 ring-brand-neon bg-brand-tertiary' : ''}`}
              disabled={!canVote}
            >
              <div
                className="absolute top-0 left-0 h-full bg-brand-neon/20"
                style={{ width: `${percentage}%` }}
              ></div>
              <div className="relative flex justify-between font-semibold">
                <span className={hasVotedForThis ? 'text-brand-neon' : 'text-brand-text'}>{option}</span>
                <span className={hasVotedForThis ? 'text-brand-neon' : 'text-brand-text-secondary'}>{votes as number} {t('votes', 'votes')}</span>
              </div>
            </button>
          );
        })}
      </div>
      {userVote && <p className="text-sm text-brand-neon text-center mt-3">{t('youVotedFor', 'You voted for "{option}"!').replace('{option}', userVote)}</p>}
    </div>
  );
};

export default Polls;