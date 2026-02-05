import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import dayjs from 'dayjs';

import { getInterviewWithRanking } from '@/lib/actions/auth.action';
import { getRandomInterviewCover } from '@/lib/utils';
import DisplayTechIcons from '@/components/DisplayTechIcons';
import RankTable from '@/components/RankTable';
import { Button } from '@/components/ui/button';

interface InfoPageProps {
  params: Promise<{ id: string }>;
}

const InterviewInfoPage = async ({ params }: InfoPageProps) => {
  const { id } = await params;

  const interviewWithRanking = await getInterviewWithRanking(id);

  if (!interviewWithRanking) {
    redirect('/');
  }

  const { interview, rankedUsers } = interviewWithRanking;
  const formattedDate = dayjs(interview.createdAt).format('MMM D, YYYY h:mm A');
  const normalizedType = /mix/gi.test(interview.type) ? 'Mixed' : interview.type;

  return (
    <section className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <Button className="btn-secondary w-fit">
          <Link href="/">← Back to Dashboard</Link>
        </Button>

        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 items-center">
              <Image
                src={getRandomInterviewCover()}
                alt="interview-cover"
                width={50}
                height={50}
                className="rounded-full object-cover size-[50px]"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold capitalize">
                  {interview.role} Interview
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex flex-row gap-2 items-center">
                <Image src="/calendar.svg" alt="calendar" width={20} height={20} />
                <span className="text-gray-400">{formattedDate}</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <span className="px-3 py-1 rounded-full bg-dark-200 text-primary-200 text-sm font-semibold">
                  {normalizedType}
                </span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <span className="px-3 py-1 rounded-full bg-dark-200 text-primary-200 text-sm font-semibold capitalize">
                  {interview.level}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Details Section */}
      <div className="bg-dark-200/50 rounded-lg p-6 border border-primary-200/20">
        <h2 className="text-2xl font-bold mb-6">Interview Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-primary-200 font-semibold mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              <DisplayTechIcons techStack={interview.techstack} />
            </div>
          </div>

          <div>
            <h3 className="text-primary-200 font-semibold mb-2">Interview Type</h3>
            <p className="text-white capitalize">{interview.type}</p>
          </div>

          <div>
            <h3 className="text-primary-200 font-semibold mb-2">Experience Level</h3>
            <p className="text-white capitalize">{interview.level}</p>
          </div>

          <div>
            <h3 className="text-primary-200 font-semibold mb-2">Total Questions</h3>
            <p className="text-white">{interview.questions?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Questions Preview Section (Optional) */}
      {interview.questions && interview.questions.length > 0 && (
        <div className="bg-dark-200/50 rounded-lg p-6 border border-primary-200/20">
          <h2 className="text-2xl font-bold mb-6">Interview Questions</h2>
          <ol className="space-y-3">
            {interview.questions.map((question, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-primary-200 font-bold flex-shrink-0">{index + 1}.</span>
                <span className="text-white">{question}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Rank List Section */}
      <div className="bg-dark-200/50 rounded-lg p-6 border border-primary-200/20">
        <h2 className="text-2xl font-bold mb-6">User Rankings</h2>
        <RankTable rankedUsers={rankedUsers} interviewId={id} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="w-full">
            Back to Dashboard
          </Link>
        </Button>
        <Button className="btn-primary flex-1">
          <Link href={`/interview/${id}`}>
            Take This Interview
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default InterviewInfoPage;