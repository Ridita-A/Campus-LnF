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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {report?.type === 'found' ? 'Claim This Found Item' : 'I Found This Item'}
          </DialogTitle>
          <DialogDescription>
            {report?.type === 'found' 
              ? (<>Send a message to <span className="font-semibold text-gray-700">{report?.userName}</span> requesting to claim: <span className="font-semibold text-blue-600">{report?.itemName}</span></>) 
              : (<>Notify <span className="font-semibold text-gray-700">{report?.userName}</span> that you found their item: <span className="font-semibold text-blue-600">{report?.itemName}</span></>)
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-red-500">*</span>
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
              rows={5}
              required
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {report?.type === 'found'
                ? "Provide details to help the owner verify you're the rightful owner"
                : "Provide details to help the owner identify their lost item"
              }
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
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
