"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const interviewFormSchema = z.object({
    type: z.string().min(1, "Type is required"),
    role: z.string().min(1, "Role is required"),
    level: z.string().min(1, "Level is required"),
    techstack: z.string().min(1, "Tech stack is required"),
    amount: z.number().min(1, "Amount of questions is required").max(20, "Maximum 20 questions allowed"),
});

type InterviewFormData = z.infer<typeof interviewFormSchema>;

const InterviewForm = ({ userId }: { userId?: string }) => {
    const router = useRouter(); // Initialize the router
    const [loading, setLoading] = React.useState(false);

    const methods = useForm<InterviewFormData>({
        resolver: zodResolver(interviewFormSchema),
        defaultValues: {
            type: '',
            role: '',
            level: '',
            techstack: '',
        },
    });

    const { control } = methods;

    const onSubmit = async (data: InterviewFormData) => {
        setLoading(true);
        try {
            const response = await fetch('/api/vapi/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, userid: userId }),
            });

            const result = await response.json();
            if (result.success) {
                router.push('/');
            } else {
                console.error("Failed to generate interview:", result.error);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField control={control} name="type" label="Interview Type" placeholder="e.g., technical, behavioral" />
                <FormField control={control} name="role" label="Job Role" placeholder="e.g., Software Engineer" />
                <FormField control={control} name="level" label="Experience Level" placeholder="e.g., Junior, Mid, Senior" />
                <FormField control={control} name="techstack" label="Tech Stack" placeholder="e.g., React, Node.js" />
                <FormField control={control} name="amount" label="Number of Questions" placeholder="e.g., 5" type="number" />

                <Button type="submit" className="btn-primary" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Generating...' : 'Generate Interview'}
                </Button>
            </form>
        </Form>
    );
};

export default InterviewForm;