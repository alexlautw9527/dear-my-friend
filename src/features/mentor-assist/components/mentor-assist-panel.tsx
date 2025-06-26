import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, X, Lightbulb, ArrowRight } from 'lucide-react';
import { FrameworkGuide } from './framework-guide';
import { QuickPrompts } from './quick-prompts';
import { MENTOR_ASSIST_FRAMEWORK } from '@/types';
import type { MentorAssistFramework } from '@/types';

interface MentorAssistPanelProps {
  isOpen: boolean;
  currentFramework: MentorAssistFramework;
  customPrompts: string[];
  onClose: () => void;
  onSetFramework: (framework: MentorAssistFramework) => void;
  onNextFramework: () => void;
  onPromptSelect: (prompt: string) => void;
  onRemoveCustomPrompt: (index: number) => void;
}

export function MentorAssistPanel({
  isOpen,
  currentFramework,
  customPrompts,
  onClose,
  onSetFramework,
  onNextFramework,
  onPromptSelect,
  onRemoveCustomPrompt,
}: MentorAssistPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    framework: true,
    quickPrompts: true,
    customPrompts: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const frameworks = [
    { key: MENTOR_ASSIST_FRAMEWORK.WHAT, label: '現況釐清', color: 'bg-blue-100 text-blue-800' },
    { key: MENTOR_ASSIST_FRAMEWORK.SO_WHAT, label: '意義洞察', color: 'bg-green-100 text-green-800' },
    { key: MENTOR_ASSIST_FRAMEWORK.NOW_WHAT, label: '行動建議', color: 'bg-orange-100 text-orange-800' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-background border-l shadow-lg z-40 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">小幫手</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 使用說明 */}
        <div className="px-4 py-3 bg-muted/30 border-b">
          <p className="text-xs text-muted-foreground">
            💡 點擊下方提示將插入到輸入框中，您可以編輯後再發送
          </p>
        </div>

        {/* 內容區域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 框架選擇區域 */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">
                思考框架
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={onNextFramework}
                className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground"
              >
                下一步
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {frameworks.map((framework, index) => (
                <div key={framework.key} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {index + 1}.
                  </div>
                  <Button
                    variant={currentFramework === framework.key ? "secondary" : "outline"}
                    size="sm"
                    className="flex-1 justify-start"
                    onClick={() => onSetFramework(framework.key)}
                  >
                    <Badge 
                      variant="secondary" 
                      className={`mr-2 ${framework.color}`}
                    >
                      {framework.label}
                    </Badge>
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* 當前框架指引 */}
          <FrameworkGuide
            framework={currentFramework}
            onPromptSelect={onPromptSelect}
          />

          {/* 快速提示 */}
          <Card className="p-4">
            <button
              className="flex items-center gap-2 text-sm font-medium mb-2"
              onClick={() => toggleSection('quickPrompts')}
            >
              {expandedSections.quickPrompts ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              快速提示
            </button>
            <p className="text-xs text-muted-foreground mb-3">
              對話開場和轉場語句，幫助自然地進入對話
            </p>
            
            {expandedSections.quickPrompts && (
              <QuickPrompts onPromptSelect={onPromptSelect} />
            )}
          </Card>

          {/* 自訂提示 */}
          {customPrompts.length > 0 && (
            <Card className="p-4">
              <button
                className="flex items-center gap-2 text-sm font-medium mb-3"
                onClick={() => toggleSection('customPrompts')}
              >
                {expandedSections.customPrompts ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                自訂提示 ({customPrompts.length})
              </button>
              
              {expandedSections.customPrompts && (
                <div className="space-y-2">
                  {customPrompts.map((prompt, index) => (
                    <div key={index} className="flex items-start gap-2 group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-left text-sm h-auto p-2 whitespace-normal"
                        onClick={() => onPromptSelect(prompt)}
                      >
                        {prompt}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveCustomPrompt(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}