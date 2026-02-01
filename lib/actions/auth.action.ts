"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { generateText } from "ai";
import {google} from "@ai-sdk/google";
import {feedbackSchema} from "@/constants";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // save user to db
    await db.collection("users").doc(uid).set({
      name,
      email,
      // profileURL,
      // resumeURL,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle Firebase specific errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    await setSessionCookie(idToken);
    return { success: true, message: "Signed in successfully." };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function getInterviewByUserId(userId:string): Promise<interview[] | null> {
  const interview = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy('createdAt', 'desc')
    .get();

    return interview.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as interview[];
} 

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] > {
  const { userId, limit = 20 } = params;

  // Build base query
  let query: FirebaseFirestore.Query = db
    .collection("interviews")
    .where("finalized", "==", true);

  // Only add the inequality filter if userId is provided
  if (typeof userId !== "undefined" && userId !== null) {
    // Firestore requires that queries with an inequality filter also include an orderBy on
    // the same field. Add ordering by userId first, then by createdAt.
    query = query.where("userId", "!=", userId).orderBy("userId", "asc").orderBy("createdAt", "desc");
  } else {
    query = query.orderBy("createdAt", "desc");
  }

  // Execute query
  const snapshot = await query.limit(limit).get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db
    .collection("interviews")
    .doc(id)
    .get();

    return interview.data() as Interview | null;
}


export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  
  const feedback = await db
  .collection('feedback')
  .where('interviewId', '==', interviewId)
  .where('userId', '==', userId)
  .limit(1)
  .get();
  
  if(feedback.empty) return null;
  const feedbackDoc = feedback.docs[0];
  
  return { id: feedbackDoc.id, ...feedbackDoc.data()} as Feedback;
}


export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript } = params;

    if (!interviewId || !userId) {
        console.error('createFeedback: missing interviewId or userId', { interviewId, userId });
        return { success: false, error: 'Missing interviewId or userId' };
    }

    if (!Array.isArray(transcript) || transcript.length === 0) {
        console.error('createFeedback: empty transcript');
        return { success: false, error: 'Empty transcript' };
    }

    try {
        const formattedTranscript = transcript
            .map((s: { role: string; content: string }) => `- ${s.role}: ${s.content}\n`)
            .join('');

        // Call model and get text output (generateText returns text)
        const aiRes = await generateText({
            model: google('gemini-2.5-flash'),
            prompt: `
You are an AI interviewer analyzing a mock interview. Output a single JSON object (no extra text) matching this schema:
{
  "totalScore": number,
  "categoryScores": [
    { "name":"Communication Skills", "score": number, "comment": string },
    { "name":"Technical Knowledge", "score": number, "comment": string },
    { "name":"Problem Solving", "score": number, "comment": string },
    { "name":"Cultural Fit", "score": number, "comment": string },
    { "name":"Confidence and Clarity", "score": number, "comment": string }
  ],
  "strengths": string[],
  "areasForImprovement": string[],
  "finalAssessment": string
}
Transcript:
${formattedTranscript}
Please return only the JSON object.
            `,
            system: "You are a professional interviewer analyzing a mock interview.",
        });

        console.log('createFeedback: aiRes', aiRes);

        // Extract text (generateText may return .text or nested output)
        const rawText = (aiRes as any).text ?? (aiRes as any).output?.[0]?.content?.[0]?.text;
        if (!rawText) {
            console.error('createFeedback: no text returned from model', { aiRes });
            return { success: false, error: 'No model output' };
        }

        // Try parsing JSON
        let parsed: any;
        try {
            parsed = JSON.parse(rawText);
        } catch (jsonErr) {
            // Try to extract JSON substring if model added extra text
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsed = JSON.parse(jsonMatch[0]);
                } catch (innerErr) {
                    console.error('createFeedback: failed parsing JSON even after extracting substring', { rawText, jsonErr, innerErr });
                    return { success: false, error: 'Failed to parse model JSON output' };
                }
            } else {
                console.error('createFeedback: model returned non-json text', { rawText, jsonErr });
                return { success: false, error: 'Model did not return JSON' };
            }
        }

        // Validate with zod schema
        const validation = feedbackSchema.safeParse(parsed);
        if (!validation.success) {
            console.error('createFeedback: validation failed', { errors: validation.error.format(), parsed });
            return { success: false, error: 'Model output failed schema validation' };
        }
        const object = validation.data;

        const feedback = {
            interviewId,
            userId,
            totalScore: object.totalScore,
            categoryScores: object.categoryScores,
            strengths: object.strengths,
            areasForImprovement: object.areasForImprovement,
            finalAssessment: object.finalAssessment,
            createdAt: new Date().toISOString(),
        };

        const newFeedback = await db.collection('feedback').add(feedback);

        return { success: true, feedbackId: newFeedback.id };
    } catch (e: any) {
        console.error('createFeedback error', e);
        return { success: false, error: e?.message ?? String(e) };
    }
}