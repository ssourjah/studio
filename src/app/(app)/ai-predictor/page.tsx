'use client';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { predictTaskDuration } from '@/ai/flows/predict-task-duration';
import type { PredictTaskDurationInput, PredictTaskDurationOutput } from '@/ai/flows/predict-task-duration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Clock, Sparkles, Zap } from 'lucide-react';
import { technicians, taskTypes } from '@/lib/mock-data';

const formSchema = z.object({
  taskType: z.string({ required_error: 'Please select a task type.' }),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  location: z.string().min(3, 'Location is required.'),
  assignedTechnician: z.string({ required_error: 'Please select a technician.' }),
});

export default function AIPredictorPage() {
  const [prediction, setPrediction] = useState<PredictTaskDurationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PredictTaskDurationInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      location: '',
    },
  });

  const onSubmit: SubmitHandler<PredictTaskDurationInput> = async (data) => {
    setIsLoading(true);
    setPrediction(null);
    try {
      const result = await predictTaskDuration(data);
      setPrediction(result);
    } catch (error) {
      console.error('Prediction failed:', error);
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: 'Could not get a prediction from the AI model. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Task Duration Predictor</CardTitle>
          <CardDescription>
            Fill in the task details below and our AI will predict the completion time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a task type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Install new fiber optic cable and configure router..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Downtown Office, 3rd Floor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTechnician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Technician</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a technician" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {technicians.map(tech => <SelectItem key={tech} value={tech}>{tech}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Predict Duration
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center">
        {isLoading && (
            <Card className="w-full flex flex-col items-center justify-center p-8 border-dashed">
                 <BrainCircuit className="h-16 w-16 text-muted-foreground animate-pulse" />
                 <p className="mt-4 text-muted-foreground">AI is thinking...</p>
            </Card>
        )}
        {prediction && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                AI Prediction Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4 rounded-lg bg-secondary p-4">
                    <Clock className="h-8 w-8 text-primary mt-1" />
                    <div>
                        <p className="text-sm text-muted-foreground">Predicted Duration</p>
                        <p className="text-2xl font-bold">{prediction.predictedDuration}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold">Confidence Level: <span className="font-normal capitalize text-accent">{prediction.confidenceLevel}</span></h4>
                    <p className="text-sm text-muted-foreground">{prediction.reasoning}</p>
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">This is an AI-generated estimate. Actual time may vary.</p>
            </CardFooter>
          </Card>
        )}
        {!isLoading && !prediction && (
            <Card className="w-full flex flex-col items-center justify-center p-8 border-dashed">
                 <BrainCircuit className="h-16 w-16 text-muted-foreground/50" />
                 <p className="mt-4 text-muted-foreground text-center">Your prediction result will appear here.</p>
            </Card>
        )}
      </div>
    </div>
  );
}
