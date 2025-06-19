import type { TutorialStep } from '@/types';
import { TUTORIAL_STEP } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, MessageCircle, User, GraduationCap, RefreshCw } from 'lucide-react';

type TutorialOverlayProps = {
  isVisible: boolean;
  currentStep: TutorialStep;
  stepTitle: string;
  onNext: () => void;
  onSkip: () => void;
  isTransitioning: boolean;
  getDemoMessage?: (role: 'apprentice' | 'mentor') => string;
};

function TutorialOverlay({
  isVisible,
  currentStep,
  stepTitle,
  onNext,
  onSkip,
  isTransitioning,
}: TutorialOverlayProps) {
  if (!isVisible) return null;

  // 計算進度百分比
  const progress = (currentStep / TUTORIAL_STEP.COMPLETE) * 100;

  // 獲取步驟圖示
  const getStepIcon = () => {
    switch (currentStep) {
      case TUTORIAL_STEP.WELCOME:
        return <MessageCircle className="h-6 w-6" />;
      case TUTORIAL_STEP.APPRENTICE_DEMO:
        return <User className="h-6 w-6" />;
      case TUTORIAL_STEP.SWITCH_GUIDE:
        return <RefreshCw className="h-6 w-6" />;
      case TUTORIAL_STEP.MENTOR_INTRO:
      case TUTORIAL_STEP.MENTOR_DEMO:
      case TUTORIAL_STEP.MENTOR_RESPONSE_REVIEW:
        return <GraduationCap className="h-6 w-6" />;
      case TUTORIAL_STEP.COMPLETE:
        return <MessageCircle className="h-6 w-6" />;
      default:
        return <MessageCircle className="h-6 w-6" />;
    }
  };

  // 獲取步驟內容
  const getStepContent = () => {
    switch (currentStep) {
      case TUTORIAL_STEP.WELCOME:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              歡迎使用 Dear My Friend！這是一個透過角色視角切換來幫助您解決問題的對話工具。
            </p>
            <p className="text-muted-foreground">
              接下來我將透過實際示範來介紹如何使用這個工具。
            </p>
            <div className="flex flex-col md:grid md:grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">學徒視角</span>
                </div>
                <p className="text-xs text-blue-700">帶著困惑尋求幫助</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">導師視角</span>
                </div>
                <p className="text-xs text-green-700">客觀分析提供建議</p>
              </div>
            </div>
          </div>
        );

      case TUTORIAL_STEP.APPRENTICE_DEMO:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              現在我們處於<strong>學徒視角</strong>，在這個模式下，您可以真實地表達內心的困惑和問題。
            </p>
            <p className="text-muted-foreground">
              點擊「發送學徒訊息」後，請參考學徒的表達內容，然後再點擊「回到教學」按鈕繼續。
            </p>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">提醒</span>
              </div>
              <p className="text-xs text-blue-700">
                發送訊息後，您可以充分時間閱讀學徒的表達方式，無需匆忙進入下一步。
              </p>
            </div>
          </div>
        );

      case TUTORIAL_STEP.SWITCH_GUIDE:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              現在請點擊<strong>視角切換按鈕</strong>來轉換到導師視角。
            </p>
            <p className="text-muted-foreground">
              系統會啟動10秒的倒數計時，這個緩衝時間幫助您從「當局者」轉換為「旁觀者」的思維模式。
            </p>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">為什麼需要倒數？</span>
              </div>
              <p className="text-xs text-amber-700">
                10秒的等待時間讓您的大腦有機會跳脫原有的思維模式，以更客觀的角度來看待問題。
              </p>
            </div>
          </div>
        );

      case TUTORIAL_STEP.MENTOR_INTRO:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              現在我們切換到了<strong>導師視角</strong>！在這個模式下，你可以把學徒當成自己的好朋友來回答問題。
            </p>
            <p className="text-muted-foreground">
              導師視角讓您能夠客觀地審視情況，像是朋友一般，提供智慧且超然的建議。
            </p>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">導師模式特點</span>
              </div>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• 客觀分析問題的根本原因</li>
                <li>• 提供具體可行的建議</li>
                <li>• 以同理心給予支持和指導</li>
              </ul>
            </div>
          </div>
        );

      case TUTORIAL_STEP.MENTOR_DEMO:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              現在我將為您示範導師視角的回應方式。觀察導師如何分析問題並提供建議。
            </p>
            <p className="text-muted-foreground">
              點擊「發送導師回應」後，請<strong>參考導師的回應內容</strong>，然後再點擊「回到教學」按鈕繼續。
            </p>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">提醒</span>
              </div>
              <p className="text-xs text-green-700">
                發送回應後，您可以充分時間閱讀，無需匆忙進入下一步。
              </p>
            </div>
          </div>
        );

      case TUTORIAL_STEP.MENTOR_RESPONSE_REVIEW: {
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              用面對朋友訴苦的視角，給自己建議，你也可以成為自己的智慧導師。
            </p>
            <div className="grid gap-2">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">導師回應的特點</span>
                </div>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• 展現同理心，理解困擾</li>
                  <li>• 引導具體分析問題</li>
                  <li>• 提供實際可行的建議</li>
                  <li>• 鼓勵進一步探索解決方案</li>
                </ul>
              </div>
            </div>     
            <p className="text-muted-foreground">
              在實際使用時，您可以根據導師的建議，切換回學徒視角繼續回應。  
            </p>

            <p className="text-muted-foreground">
              從不斷切換視角的自我對話覺察中，找到解決問題的答案。             
            </p>
          </div>
        );
      }

      case TUTORIAL_STEP.COMPLETE:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              🎉 恭喜！您已經完成了互動式教學。
            </p>
            <p className="text-muted-foreground">
              現在您可以開始使用 Dear My Friend 來幫助自己解決問題了。記住：
            </p>
            <div className="grid gap-2 mt-4">
              <div className="p-2 rounded bg-muted text-sm">
                <strong>1.</strong> 自己以學徒視角真實表達困惑
              </div>
              <div className="p-2 rounded bg-muted text-sm">
                <strong>2.</strong> 切換視角並等待10秒思考
              </div>
              <div className="p-2 rounded bg-muted text-sm">
                <strong>3.</strong> 自己以導師視角提供客觀建議
              </div>
              <div className="p-2 rounded bg-muted text-sm">
                <strong>4.</strong> 重複對話直到找到解決方案
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 獲取按鈕文字
  const getButtonText = () => {
    switch (currentStep) {
      case TUTORIAL_STEP.WELCOME:
        return '開始教學';
      case TUTORIAL_STEP.APPRENTICE_DEMO:
        return '發送學徒訊息';
      case TUTORIAL_STEP.SWITCH_GUIDE:
        return '我知道了，去切換';
      case TUTORIAL_STEP.MENTOR_INTRO:
        return '繼續';
      case TUTORIAL_STEP.MENTOR_DEMO:
        return '發送導師回應';
      case TUTORIAL_STEP.MENTOR_RESPONSE_REVIEW:
        return '我了解了';
      case TUTORIAL_STEP.COMPLETE:
        return '開始使用';
      default:
        return '下一步';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 relative">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              {getStepIcon()}
            </div>
            <CardTitle className="text-xl">{stepTitle}</CardTitle>
          </div>
          
          {/* 進度條 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>步驟 {currentStep + 1} / {TUTORIAL_STEP.COMPLETE + 1}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-6">
            {getStepContent()}
            
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={onSkip}
                className="text-sm"
              >
                跳過教學
              </Button>
              
              <Button
                onClick={onNext}
                disabled={isTransitioning}
                className="flex items-center gap-2"
              >
                {getButtonText()}
                {currentStep !== TUTORIAL_STEP.COMPLETE && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TutorialOverlay; 