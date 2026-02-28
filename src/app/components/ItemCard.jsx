import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card.jsx";
import { Badge } from "@/app/components/ui/badge.jsx";
import { Button } from "@/app/components/ui/button.jsx";
import { MapPin, Calendar, User, CheckCircle, Tag, HandHeart, Archive } from "lucide-react";
import ImageWithFallback from "@/app/components/ui/ImageWithFallback.jsx";
import { ClaimModal } from "@/app/components/ClaimModal.jsx";
import { ItemDetailModal } from "@/app/components/ItemDetailModal.jsx";
import { toast } from "sonner";

export function ItemCard({ report, currentUserId, onArchive }) {
  const isOwner = report.userId === currentUserId;
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

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

  const handleClaimClick = (e) => {
    e.stopPropagation();
    setShowClaimModal(true);
  };

  return (
    <>
      <Card 
        onClick={() => setShowDetailModal(true)}
        className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 hover:-translate-y-1 cursor-pointer"
      >
      {/* Image Section */}
      {report.imageUrl && (
        <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
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
          {report.status === "resolved" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="outline" className="bg-white text-green-700 border-green-400 shadow-lg px-3 py-1.5 text-sm font-semibold">
                <CheckCircle className="size-4 mr-1.5" />
                Resolved
              </Badge>
            </div>
          )}
          {/* Floating type badge on image */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant={report.type === "lost" ? "destructive" : "default"} 
              className={`shadow-lg backdrop-blur-sm ${report.type === "lost" ? 'bg-red-500/90' : 'bg-green-500/90'} text-white px-3 py-1 text-xs font-bold`}
            >
              {report.type === "lost" ? "LOST" : "FOUND"}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-2 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold truncate text-gray-900">
              {report.itemName}
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-0.5">
              <Tag className="size-3" />
              {report.category}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pt-2">
        {/* Claim Buttons */}
        {report.type === "found" && !isOwner && report.status === "active" && (
          <Button 
            onClick={handleClaimClick}
            className="w-full mt-2 bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-bold py-6 text-base group rounded-xl"
          >
            <HandHeart className="size-5 mr-2 group-hover:scale-110 transition-transform" />
            I Lost This
          </Button>
        )}
        
        {report.type === "lost" && !isOwner && report.status === "active" && (
          <Button 
            onClick={handleClaimClick}
            className="w-full mt-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-bold py-6 text-base group rounded-xl"
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
            className="w-full mt-2 border-2 border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-4 text-sm"
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
