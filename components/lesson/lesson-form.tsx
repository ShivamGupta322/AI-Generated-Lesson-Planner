'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Wand2, FileText, Download, Edit } from 'lucide-react';
import type { LessonPlan } from '@/lib/types';
import { generateLessonPlan, buildLessonPrompt } from '@/lib/gemini';
import { generatePDF } from '@/lib/pdf-generator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const sampleLessonPlan: Partial<LessonPlan> = {
  topic: 'Photosynthesis: Nature\'s Solar Power',
  gradeLevel: '6th Grade',
  mainConcept: 'Understanding how plants convert sunlight into energy through photosynthesis',
  subTopics: [
    'Light energy and chlorophyll',
    'Carbon dioxide and water as reactants',
    'Glucose and oxygen as products',
    'The role of chloroplasts'
  ],
  materials: [
    'Live plants',
    'Microscope',
    'Plant cell diagrams',
    'Colored pencils',
    'Photosynthesis simulation software'
  ],
  objectives: [
    'Explain the basic process of photosynthesis',
    'Identify the key components needed for photosynthesis',
    'Draw and label the parts of a chloroplast',
    'Describe how plants store and use energy'
  ],
  outline: {
    introduction: 'Begin with a demonstration using a live plant and asking students how they think plants get their food. Connect this to their prior knowledge about energy and living things.',
    development: 'Use interactive diagrams and models to explain the photosynthesis process. Guide students through the reactants and products using molecular models. Demonstrate the role of chloroplasts using microscope observations.',
    practice: 'Students will work in groups to create their own photosynthesis models, label diagrams, and run simple experiments with plants in different light conditions.',
    assessment: 'Students will complete a concept map showing the relationships between sunlight, chlorophyll, water, carbon dioxide, glucose, and oxygen in photosynthesis.',
    closure: 'Review key concepts through a quick quiz game. Students share one new thing they learned about how plants make their own food.'
  }
};

export default function LessonForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiContent, setAiContent] = useState<string>('');
  const [isEditingAI, setIsEditingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonPlan, setLessonPlan] = useState<Partial<LessonPlan>>(sampleLessonPlan);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof LessonPlan
  ) => {
    setLessonPlan((prev) => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleArrayInputChange = (
    value: string,
    index: number,
    field: 'subTopics' | 'materials' | 'objectives'
  ) => {
    setLessonPlan((prev) => ({
      ...prev,
      [field]: prev[field]?.map((item, i) => (i === index ? value : item))
    }));
  };

  const handleAddArrayItem = (field: 'subTopics' | 'materials' | 'objectives') => {
    setLessonPlan((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const handleRemoveArrayItem = (
    index: number,
    field: 'subTopics' | 'materials' | 'objectives'
  ) => {
    setLessonPlan((prev) => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index)
    }));
  };

  const handleOutlineChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    field: keyof LessonPlan['outline']
  ) => {
    setLessonPlan((prev) => ({
      ...prev,
      outline: {
        ...prev.outline,
        [field]: e.target.value
      }
    }));
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error('Please configure your Gemini API key in the .env file');
      }
      
      const prompt = buildLessonPrompt(lessonPlan);
      const generatedContent = await generateLessonPlan(prompt);
      setAiContent(generatedContent);
      setLessonPlan(prev => ({
        ...prev,
        aiContent: generatedContent
      }));
      toast({
        title: 'Success!',
        description: 'AI content generated successfully.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI content';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setAiContent(newContent);
    setLessonPlan(prev => ({
      ...prev,
      aiContent: newContent
    }));
  };

  const handleDownloadPDF = () => {
    try {
      const pdfDataUri = generatePDF(lessonPlan);
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfDataUri;
      downloadLink.download = `${lessonPlan.topic?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'lesson_plan'}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: 'Success!',
        description: 'PDF downloaded successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save logic would go here
      handleDownloadPDF();
      toast({
        title: 'Success!',
        description: 'Lesson plan created successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create lesson plan. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderArrayInputs = (
    title: string,
    field: 'subTopics' | 'materials' | 'objectives',
    placeholder: string
  ) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{title}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddArrayItem(field)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      {lessonPlan[field]?.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => handleArrayInputChange(e.target.value, index, field)}
            placeholder={placeholder}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveArrayItem(index, field)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={lessonPlan.topic}
              onChange={(e) => handleInputChange(e, 'topic')}
              placeholder="Enter lesson topic"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeLevel">Grade Level</Label>
            <Input
              id="gradeLevel"
              value={lessonPlan.gradeLevel}
              onChange={(e) => handleInputChange(e, 'gradeLevel')}
              placeholder="Enter grade level"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mainConcept">Main Concept</Label>
            <Input
              id="mainConcept"
              value={lessonPlan.mainConcept}
              onChange={(e) => handleInputChange(e, 'mainConcept')}
              placeholder="Enter main concept"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderArrayInputs('Sub-topics', 'subTopics', 'Enter a sub-topic')}
          {renderArrayInputs('Materials Needed', 'materials', 'Enter required material')}
          {renderArrayInputs('Learning Objectives', 'objectives', 'Enter an objective')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Outline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="introduction">Introduction</Label>
            <Textarea
              id="introduction"
              value={lessonPlan.outline?.introduction}
              onChange={(e) => handleOutlineChange(e, 'introduction')}
              placeholder="Describe how you will introduce the lesson"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="development">Development</Label>
            <Textarea
              id="development"
              value={lessonPlan.outline?.development}
              onChange={(e) => handleOutlineChange(e, 'development')}
              placeholder="Describe the main teaching activities"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="practice">Practice</Label>
            <Textarea
              id="practice"
              value={lessonPlan.outline?.practice}
              onChange={(e) => handleOutlineChange(e, 'practice')}
              placeholder="Describe student practice activities"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assessment">Assessment</Label>
            <Textarea
              id="assessment"
              value={lessonPlan.outline?.assessment}
              onChange={(e) => handleOutlineChange(e, 'assessment')}
              placeholder="Describe how you will assess student learning"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closure">Closure</Label>
            <Textarea
              id="closure"
              value={lessonPlan.outline?.closure}
              onChange={(e) => handleOutlineChange(e, 'closure')}
              placeholder="Describe how you will conclude the lesson"
              required
            />
          </div>
        </CardContent>
      </Card>

      {aiContent && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>AI-Generated Content</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingAI(!isEditingAI)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditingAI ? 'Preview' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingAI ? (
              <Textarea
                value={aiContent}
                onChange={handleAIContentChange}
                className="min-h-[300px] font-mono text-sm"
                placeholder="AI-generated content will appear here"
              />
            ) : (
              <div className="whitespace-pre-wrap font-mono text-sm border rounded-md p-4 bg-muted">
                {aiContent}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateAI}
            disabled={isGenerating}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={!aiContent}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
        <Button type="submit" disabled={isLoading}>
          <FileText className="mr-2 h-4 w-4" />
          {isLoading ? 'Creating...' : 'Create Lesson Plan'}
        </Button>
      </div>
    </form>
  );
}