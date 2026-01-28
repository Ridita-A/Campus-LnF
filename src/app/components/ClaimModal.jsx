import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog.jsx";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea.jsx";
import { Label } from "@/app/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export function ClaimModal({ isOpen, onClose, report, userId }) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine the endpoint based on report type
      const endpoint = report.type === 'found' 
        ? 'http://localhost:3000/api/claims/create/found'
        : 'http://localhost:3000/api/claims/create/lost';
      
      const payload = report.type === 'found'
        ? {
            requester_id: userId,
            found_report_id: report.id,
            message: message
          }
        : {
            requester_id: userId,
            lost_report_id: report.id,
            message: message
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to send claim request');
      }

      toast.success('Claim request sent successfully!');
      setMessage("");
      onClose();
    } catch (error) {
      console.error('Error sending claim request:', error);
      toast.error('Failed to send claim request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] border-2 border-gray-200">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {report?.type === 'found' ? '🔍 Claim This Found Item' : '✨ I Found This Item'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {report?.type === 'found' 
              ? (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                  Send a message to <span className="font-bold text-gray-800">{report?.userName}</span> requesting to claim: <span className="font-bold text-blue-700">{report?.itemName}</span>
                </div>
              ) 
              : (
                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                  Notify <span className="font-bold text-gray-800">{report?.userName}</span> that you found their item: <span className="font-bold text-green-700">{report?.itemName}</span>
                </div>
              )
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="message" className="text-base font-semibold">
              Your Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder={
                report?.type === 'found'
                  ? "Describe why this item is yours (e.g., color, brand, unique features, where you lost it...)"
                  : "Describe the item you found (e.g., where you found it, color, brand, condition...)"
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              className="resize-none border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-xl text-base"
            />
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-200">
              {report?.type === 'found'
                ? "💡 Provide details to help the owner verify you're the rightful owner"
                : "💡 Provide details to help the owner identify their lost item"
              }
            </p>
          </div>

          <DialogFooter className="gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="border-2 hover:bg-gray-100 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl font-bold px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="size-5 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
