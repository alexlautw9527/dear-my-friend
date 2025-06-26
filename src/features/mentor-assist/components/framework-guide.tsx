import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Eye, Target } from 'lucide-react';
import { MENTOR_ASSIST_FRAMEWORK } from '@/types';
import { MENTOR_ASSIST } from '@/constants';
import type { MentorAssistFramework } from '@/types';

interface FrameworkGuideProps {
  framework: MentorAssistFramework;
  onPromptSelect: (prompt: string) => void;
}

const FRAMEWORK_ICONS = {
  [MENTOR_ASSIST_FRAMEWORK.WHAT]: MessageCircle,
  [MENTOR_ASSIST_FRAMEWORK.SO_WHAT]: Eye,
  [MENTOR_ASSIST_FRAMEWORK.NOW_WHAT]: Target,
};

const FRAMEWORK_COLORS = {
  [MENTOR_ASSIST_FRAMEWORK.WHAT]: 'bg-blue-100 text-blue-800',
  [MENTOR_ASSIST_FRAMEWORK.SO_WHAT]: 'bg-green-100 text-green-800',
  [MENTOR_ASSIST_FRAMEWORK.NOW_WHAT]: 'bg-orange-100 text-orange-800',
};

export function FrameworkGuide({ framework, onPromptSelect }: FrameworkGuideProps) {
  const frameworkData = MENTOR_ASSIST.FRAMEWORK_PROMPTS[framework.toUpperCase() as keyof typeof MENTOR_ASSIST.FRAMEWORK_PROMPTS];
  const Icon = FRAMEWORK_ICONS[framework];
  const colorClass = FRAMEWORK_COLORS[framework];

  return (
    <Card className="p-4">
      {/* 框架標題 */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-full ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">{frameworkData.title}</h4>
          <p className="text-xs text-muted-foreground">{frameworkData.description}</p>
        </div>
      </div>

      {/* 引導問題 */}
      <div className="space-y-2 mb-4">
        <div className="flex flex-col gap-1">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            引導問題
          </h5>
          <p className="text-xs text-muted-foreground">
            結構化思考引導，幫助深入分析問題
          </p>
        </div>
        <div className="space-y-1">
          {frameworkData.prompts.map((prompt, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left h-auto p-2 whitespace-normal text-xs"
              onClick={() => onPromptSelect(prompt)}
            >
              <span className="mr-2 text-muted-foreground">•</span>
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {/* 建議思考方向 */}
      <div className="border-t pt-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            建議思考
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground italic">
          {frameworkData.placeholder}
        </p>
      </div>
    </Card>
  );
}