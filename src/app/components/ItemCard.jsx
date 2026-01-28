import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card.jsx";
import { Badge } from "@/app/components/ui/badge.jsx";
import { Button } from "@/app/components/ui/button.jsx";
import { MapPin, Calendar, User, CheckCircle, Tag, HandHeart, Archive } from "lucide-react";
import ImageWithFallback from "@/app/components/ui/ImageWithFallback.jsx";
import { ClaimModal } from "@/app/components/ClaimModal.jsx";
import { toast } from "sonner";

export function ItemCard({ report, currentUserId, onArchive }) {
  const isOwner = report.userId === currentUserId;
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      const endpoint = report.type === 'lost' 
        ? `http://localhost:3000/api/archive/lost/${report.id}`
        : `http://localhost:3000/api/archive/found/${report.id}`;

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

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 hover:-translate-y-1">
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

      <CardHeader className="pb-3 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold truncate text-gray-900">
              {report.itemName}
            </CardTitle>
            <CardDescription className="mt-1.5 flex items-center gap-1.5">
              <Tag className="size-3" />
              <span className="font-medium">{report.category}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3.5 pt-4">
        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{report.description}</p>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-blue-50 rounded-lg p-2.5 border border-blue-100">
          <div className="bg-blue-500 rounded-full p-1.5">
            <User className="size-3.5 text-white" />
          </div>
          <span className="truncate font-semibold">{report.userName}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-green-50 rounded-lg p-2.5 border border-green-100">
          <div className="bg-green-500 rounded-full p-1.5">
            <MapPin className="size-3.5 text-white" />
          </div>
          <span className="truncate font-medium">{report.location}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-purple-50 rounded-lg p-2.5 border border-purple-100">
          <div className="bg-purple-500 rounded-full p-1.5">
            <Calendar className="size-3.5 text-white" />
          </div>
          <span className="font-medium">{new Date(report.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}</span>
        </div>

        {/* Tags */}
        {report.tags && report.tags.length > 0 && (
          <div className="flex items-start gap-2 pt-2 border-t-2 border-gray-200">
            <div className="flex flex-wrap gap-1.5">
              {report.tags.map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all cursor-default font-medium"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Claim Buttons with enhanced styling */}
        {/* For FOUND items: User can claim if they lost it */}
        {report.type === "found" && !isOwner && report.status === "active" && (
          <Button 
            onClick={() => setShowClaimModal(true)}
            className="w-full mt-4 bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-bold py-6 text-base group"
          >
            <HandHeart className="size-5 mr-2 group-hover:scale-110 transition-transform" />
            I Lost This Item
          </Button>
        )}
        
        {/* For LOST items: User can notify owner they found it */}
        {report.type === "lost" && !isOwner && report.status === "active" && (
          <Button 
            onClick={() => setShowClaimModal(true)}
            className="w-full mt-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-bold py-6 text-base group"
          >
            <HandHeart className="size-5 mr-2 group-hover:scale-110 transition-transform" />
            I Found This Item
          </Button>
        )}
        
        {/* Owner badge and archive button */}
        {isOwner && report.status !== "archived" && (
          <div className="mt-4 space-y-2">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-3 text-center">
              <p className="text-sm font-semibold text-purple-700">✨ Your Report</p>
            </div>
            <Button
              onClick={handleArchive}
              disabled={isArchiving}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 group"
            >
              <Archive className="size-4 mr-2 group-hover:scale-110 transition-transform" />
              {isArchiving ? 'Archiving...' : 'Archive Item'}
            </Button>
          </div>
        )}
        
        {/* Archived badge */}
        {report.status === "archived" && (
          <div className="mt-4 bg-gray-100 border-2 border-gray-300 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-gray-600">📦 Archived</p>
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
    </>
  );
}
