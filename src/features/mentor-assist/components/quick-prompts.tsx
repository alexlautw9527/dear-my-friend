import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { MENTOR_ASSIST } from '@/constants';

interface QuickPromptsProps {
  onPromptSelect: (prompt: string) => void;
}

export function QuickPrompts({ onPromptSelect }: QuickPromptsProps) {
  return (
    <div className="space-y-2">
      {MENTOR_ASSIST.QUICK_PROMPTS.map((prompt, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left h-auto p-3 whitespace-normal text-xs hover:bg-muted/50"
          onClick={() => onPromptSelect(prompt)}
        >
          <div className="flex items-start gap-2">
            <Sparkles className="h-3 w-3 mt-0.5 text-primary/60 flex-shrink-0" />
            <span>{prompt}</span>
          </div>
        </Button>
      ))}
    </div>
  );
}