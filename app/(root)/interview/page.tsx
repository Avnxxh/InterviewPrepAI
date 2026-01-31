import Agent from "@/components/Agent";
import InterviewForm from "@/components/InterviewForm";
import {getCurrentUser} from "@/lib/actions/auth.action";

const Page = async () => {
    const user = await getCurrentUser();

    return (
        <>
            <h3>Interview Generation</h3>

            <InterviewForm userId={user?.id} />
        </>
    )
}
export default Page;