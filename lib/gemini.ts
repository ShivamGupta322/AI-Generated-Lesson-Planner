import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with error handling
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function generateLessonPlan(prompt: string) {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw new Error('Failed to generate lesson plan. Please check your API key and try again.');
  }
}

export function buildLessonPrompt(lessonPlan: Partial<LessonPlan>) {
  return `Create a detailed lesson plan for the following:
Topic: ${lessonPlan.topic}
Grade Level: ${lessonPlan.gradeLevel}
Main Concept: ${lessonPlan.mainConcept}
Sub-topics: ${lessonPlan.subTopics?.join(', ')}
Learning Objectives: ${lessonPlan.objectives?.join(', ')}

Please provide a structured response with the following sections:
1. Detailed Lesson Content
   - Key concepts and vocabulary
   - Step-by-step teaching points
   - Examples and analogies

2. Suggested Classroom Activities
   - Warm-up activities
   - Main learning activities
   - Group work suggestions
   - Interactive elements

3. Assessment Strategies
   - Formative assessment questions
   - Exit ticket ideas
   - Extension activities
   - Differentiation suggestions

Format the response in a clear, organized manner suitable for a professional lesson plan.`;
}