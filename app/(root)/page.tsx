import React from 'react'
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {dummyInterviews} from "@/constants";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser, getInterviewByUserId, getLatestInterviews, getFeedbackByInterviewId } from '@/lib/actions/auth.action';

const Page = async () => {
    const user = await getCurrentUser();

    const [userInterviews, latestInterviews] = await Promise.all([
        getInterviewByUserId(user?.id || ''),
        getLatestInterviews({ userId: user?.id || '' })
    ]);
    
    const hasPastInterviews = userInterviews && userInterviews.length > 0;
    const hasUpcomingInterviews = latestInterviews?.length > 0;

    // Pre-fetch feedback for all user interviews
    const interviewsWithFeedback = await Promise.all(
        userInterviews?.map(async (interview) => {
            const feedback = user?.id && interview.id
                ? await getFeedbackByInterviewId({ interviewId: interview.id, userId: user.id })
                : null;
            return { ...interview, feedback };
        }) || []
    );

    return (
        <>
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
                    <p className="text-lg">
                        Practice on real interview questions & get instant feedback
                    </p>
                    
                    <Button asChild className="btn-primary max-sm:w-full">
                <Link href="/interview">Start an Interview</Link>
                    </Button>
                </div>

                <Image src="/robot.png" alt="robo-dude" width={400} height={400} className="max-sm:hidden" />
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>

                <div className="interviews-section">
                    {hasPastInterviews ? (
                        interviewsWithFeedback?.map((interview) => (
                            <InterviewCard {...interview} key={interview.id} feedback={interview.feedback} />
                        ))
                    ) : (
                        <p>No past interviews yet</p>
                    )}
                </div>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Available Interviews</h2>

                <div className="interviews-section">
                    {hasUpcomingInterviews ? (
                        latestInterviews?.map((interview) => (
                            <InterviewCard {...interview} key={interview.id} feedback={null} />
                        ))
                    ) : (
                        <p>No interviews available</p>
                    )}
                </div>
            </section>
        </>
    )
}
export default Page
