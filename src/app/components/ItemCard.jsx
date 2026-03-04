import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card.jsx";
import { Badge } from "@/app/components/ui/badge.jsx";
import { Button } from "@/app/components/ui/button.jsx";
import { MapPin, Calendar, User, CheckCircle, Tag, HandHeart, Archive, Package, Trash2 } from "lucide-react";
import ImageWithFallback from "@/app/components/ui/ImageWithFallback.jsx";
import { ClaimModal } from "@/app/components/ClaimModal.jsx";
import { ItemDetailModal } from "@/app/components/ItemDetailModal.jsx";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
} from "@/app/components/ui/alert-dialog.jsx";
import { toast } from "sonner";

export function ItemCard({ report, currentUserId, onArchive }) {
  const isOwner = report.userId === currentUserId;
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleArchive = async (e) => {
    e.stopPropagation();
    setIsArchiving(true);
    try {
      const endpoint = report.type === 'lost' 
        ? `http://localhost:3000/api/archive/lost/${report.dbId}`
        : `http://localhost:3000/api/archive/found/${report.dbId}`;

      const response = await fetch(endpoint, { method: 'POST' });

      if (!response.ok) {
        throw new Error('Failed to archive item');
      }

      toast.success('Item archived successfully!');
      if (onArchive) onArchive(report.id);
    } catch (error) {
      console.error('Error archiving item:', error);
      toast.error('Failed to archive item');
    } finally {
      setIsArchiving(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const endpoint = report.type === 'lost' 
      ? `http://localhost:3000/api/lost/${report.dbId}`
      : `http://localhost:3000/api/found/${report.dbId}`;
    
    console.log(`Deleting report type: ${report.type}, ID: ${report.dbId}`);
    console.log(`Requesting endpoint: ${endpoint}`);

    try {
      const response = await fetch(endpoint, { method: 'DELETE' });

      if (!response.ok) {
        console.error(`Delete failed with status: ${response.status}`);
        throw new Error('Failed to delete item');
      }

      toast.success('Post deleted successfully!');
      if (onArchive) onArchive(report.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleClaimClick = (e) => {
    e.stopPropagation();
    setShowClaimModal(true);
  };

  return (
    <>
      <Card 
        onClick={() => setShowDetailModal(true)}
        className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 hover:-translate-y-1 cursor-pointer gap-0.5"
      >
      {/* Image Section - Now always visible to show the badge */}
      <div className="relative h-60 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {report.imageUrl ? (
          <>
            <ImageWithFallback
              src={report.imageUrl}
              alt={report.itemName}
              className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <Package className="size-16 opacity-20" />
            <span className="text-xs font-medium opacity-40 italic">No image provided</span>
          </div>
        )}

        {report.status === "resolved" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="outline" className="bg-white text-green-700 border-green-400 shadow-lg px-3 py-1.5 text-sm font-semibold">
              <CheckCircle className="size-4 mr-1.5" />
              Resolved
            </Badge>
          </div>
        )}

        {/* Floating type badge - Top Left */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant={report.type === "lost" ? "destructive" : "default"} 
            className={`shadow-lg backdrop-blur-sm ${report.type === "lost" ? 'bg-red-500/90' : 'bg-green-500/90'} text-white px-3 py-1 text-xs font-bold`}
          >
            {report.type === "lost" ? "LOST" : "FOUND"}
          </Badge>
        </div>

        {/* Delete Button - Top Right (Only for owners) */}
        {isOwner && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="destructive"
              className="size-8 rounded-full shadow-lg bg-red-600/90 hover:bg-red-700"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              disabled={isDeleting}
              title="Delete Post"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <CardHeader className="bg-gradient-to-br from-white to-gray-50 p-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold truncate text-gray-900">
              {report.itemName}
            </CardTitle>
            <div className="flex flex-wrap items-center justify-between w-full gap-y-1 text-xs text-gray-500 font-medium mt-4">
              <span className="flex items-center gap-1">
                <Tag className="size-3.5" />
                {report.category}
              </span>
              {report.location && (
                <span className="flex items-center gap-1" title={report.location}>
                  <MapPin className="size-3.5" />
                  <span className="truncate max-w-[100px] sm:max-w-[150px]">{report.location}</span>
                </span>
              )}
              {report.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {new Date(report.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-4 pt-1">
        {/* Claim Buttons */}
        {report.type === "found" && !isOwner && report.status === "active" && (
          <Button 
            onClick={handleClaimClick}
            className="w-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-bold py-6 text-base group rounded-xl"
          >
            <HandHeart className="size-5 mr-2 group-hover:scale-110 transition-transform" />
            I Lost This
          </Button>
        )}
        
        {report.type === "lost" && !isOwner && report.status === "active" && (
          <Button 
            onClick={handleClaimClick}
            className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-bold py-6 text-base group rounded-xl"
          >
            <HandHeart className="size-5 mr-2 group-hover:scale-110 transition-transform" />
            I Found This
          </Button>
        )}
        
        {isOwner && report.status !== "archived" && (
          <Button
            onClick={handleArchive}
            disabled={isArchiving}
            variant="outline"
            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-bold py-6 text-base group rounded-xl"
          >
            <Archive className="size-3.5 mr-2" />
            {isArchiving ? '...' : 'Archive'}
          </Button>
        )}
        
        {report.status === "archived" && (
          <div className="mt-2 bg-gray-100 rounded-md p-2 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Archived</p>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post
            for "{report.itemName}" and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Post"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <ClaimModal
      isOpen={showClaimModal}
      onClose={() => setShowClaimModal(false)}
      report={report}
      userId={currentUserId}
    />

    <ItemDetailModal
      isOpen={showDetailModal}
      onClose={() => setShowDetailModal(false)}
      report={report}
      currentUserId={currentUserId}
      onClaim={() => setShowClaimModal(true)}
    />
    </>
  );
}
