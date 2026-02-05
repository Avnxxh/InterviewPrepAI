import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface RankedUser {
  userId: string;
  userName: string;
  score: number;
  attemptDate: string;
  feedbackId: string;
}

interface RankTableProps {
  rankedUsers: RankedUser[];
  interviewId: string;
}

const RankTable: React.FC<RankTableProps> = ({ rankedUsers, interviewId }) => {
  if (rankedUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-400">No one has completed this interview yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-primary-200">
            <th className="text-left py-4 px-4 font-semibold text-primary-100">Rank</th>
            <th className="text-left py-4 px-4 font-semibold text-primary-100">User Name</th>
            <th className="text-center py-4 px-4 font-semibold text-primary-100">Score</th>
            <th className="text-center py-4 px-4 font-semibold text-primary-100">Interview Given Time</th>
            <th className="text-center py-4 px-4 font-semibold text-primary-100">Action</th>
          </tr>
        </thead>
        <tbody>
          {rankedUsers.map((user, index) => (
            <tr 
              key={user.feedbackId} 
              className="border-b border-dark-200 hover:bg-dark-200/50 transition-colors"
            >
              <td className="py-4 px-4">
                <span className="text-lg font-bold text-primary-200">#{index + 1}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-white">{user.userName}</span>
              </td>
              <td className="py-4 px-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Image src="/star.svg" alt="star" width={18} height={18} />
                  <span className="font-semibold text-white">{user.score}/100</span>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-gray-400 text-sm">
                  {dayjs(user.attemptDate).format('MMM D, YYYY h:mm A')}
                </span>
              </td>
              <td className="py-4 px-4 text-center">
                <Button className="btn-primary text-sm">
                  <Link href={`/interview/${interviewId}/feedback/${user.userId}`}>
                    View Feedback
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankTable;