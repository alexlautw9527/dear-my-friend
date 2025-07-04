import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, GraduationCap, RefreshCw, Download, HelpCircle, PlayCircle } from 'lucide-react';

type IntroductionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTutorial?: () => void;
};

function IntroductionModal({ open, onOpenChange, onStartTutorial }: IntroductionModalProps) {
  const handleStartTutorial = () => {
    onStartTutorial?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="text-center p-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold mb-2">
            <span className="flex items-center justify-center gap-2 mb-3">
              <HelpCircle className="h-6 w-6 text-primary" />
              使用說明
            </span>
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            了解 Dear My Friend 的核心概念與使用方法
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-6 py-4">
            {/* 核心概念 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">學徒視角</h3>
                    <Badge variant="secondary" className="text-xs">
                      尋求幫助
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  帶著困惑尋求幫助的自己，真實表達內心的疑慮與問題
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">導師視角</h3>
                    <Badge variant="secondary" className="text-xs">
                      提供建議
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  以第三者角度提供建議的自己，客觀分析並給出智慧回應
                </p>
              </div>
            </div>

            {/* 使用步驟 */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                如何使用
              </h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">以學徒身份開始</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      輸入您遇到的問題或困惑
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      點擊視角切換按鈕
                      <RefreshCw className="h-3 w-3" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      經過 10 秒緩衝進入導師思考模式
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">以導師身份回應</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      客觀分析問題並提供建議
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      重複切換對話
                      <Download className="h-3 w-3" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      持續深化思考，也可隨時匯出對話記錄
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 p-6 pt-4 flex-shrink-0">
          <div className="flex gap-2 ml-auto">
            <Button 
              variant="outline" 
              onClick={handleStartTutorial}
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              教學模式
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              關閉
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default IntroductionModal; 