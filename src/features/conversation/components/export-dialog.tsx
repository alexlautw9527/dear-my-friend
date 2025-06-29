import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, FileText, Copy, Check } from 'lucide-react';
import { useConversationStore } from '@/store';

type ExportFormat = 'markdown' | 'text';

type ExportDialogProps = {
  children: React.ReactNode;
};

function ExportDialog({ children }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown');
  const [isCopied, setIsCopied] = useState(false);
  const { exportMessages, messages, tutorialMessages, isTutorialMode } = useConversationStore();

  const exportContent = useMemo(() => {
    return exportMessages(selectedFormat);
  }, [exportMessages, selectedFormat, messages, tutorialMessages, isTutorialMode]);

  const handleExport = () => {
    if (!exportContent) {
      return;
    }

    const filename = `dear-my-friend-${new Date().toISOString().split('T')[0]}.${selectedFormat === 'markdown' ? 'md' : 'txt'}`;
    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsOpen(false);
  };

  const handleCopyToClipboard = async () => {
    if (!exportContent) {
      return;
    }

    try {
      await navigator.clipboard.writeText(exportContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('複製到剪貼簿失敗:', error);
    }
  };

  const previewContent = useMemo(() => {
    if (!exportContent) {
      return '沒有對話記錄可匯出';
    }
    
    return exportContent;
  }, [exportContent]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            匯出對話記錄
          </DialogTitle>
          <DialogDescription>
            選擇匯出格式，然後下載或複製到剪貼簿
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* 格式選擇 */}
          <div className="space-y-2 flex-shrink-0">
            <label className="text-sm font-medium">匯出格式</label>
            <div className="flex gap-2">
              <Button
                variant={selectedFormat === 'markdown' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFormat('markdown')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Markdown (.md)
              </Button>
              <Button
                variant={selectedFormat === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFormat('text')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                純文字 (.txt)
              </Button>
            </div>
          </div>

          {/* 預覽 */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <label className="text-sm font-medium flex-shrink-0">預覽</label>
            <div className="flex-1 border rounded-md bg-muted overflow-auto p-3 min-h-0">
              <pre className="text-xs whitespace-pre-wrap font-mono break-words">
                {previewContent}
              </pre>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleCopyToClipboard}
            className="flex items-center gap-2"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                已複製
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                複製到剪貼簿
              </>
            )}
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            下載檔案
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExportDialog; 