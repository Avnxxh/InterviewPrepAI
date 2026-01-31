import { redirect } from 'next/navigation';
import { getInterviewById } from '@/lib/actions/auth.action';
import React from 'react'

const page = async ({ params }: RouteParams) => {
    const { id } = await params;
    const interview = await getInterviewById(id);

    if (!interview) redirect('/');
  return (
    <div>
      Page
    </div>
  )
}

export default page
