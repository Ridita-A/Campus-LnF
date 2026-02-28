import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog.jsx";
import { Badge } from "@/app/components/ui/badge.jsx";
import { Button } from "@/app/components/ui/button.jsx";
import { 
  MapPin, 
  Calendar, 
  User, 
  Tag, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  HandHeart
} from "lucide-react";
import ImageWithFallback from "@/app/components/ui/ImageWithFallback.jsx";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel.jsx";

export function ItemDetailModal({ isOpen, onClose, report, currentUserId, onClaim }) {
  if (!report) return null;

  const isOwner = report.userId === currentUserId;
  const images = report.imageUrls && report.imageUrls.length > 0 
    ? report.imageUrls 
    : (report.imageUrl ? [report.imageUrl] : []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2 pr-12 bg-white">
          <div className="flex flex-wrap items-center gap-3">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {report.itemName}
            </DialogTitle>
            <Badge 
              variant={report.type === "lost" ? "destructive" : "default"} 
              className={`${report.type === "lost" ? 'bg-red-500' : 'bg-green-500'} text-white px-3 py-1 font-bold uppercase tracking-wider shadow-sm`}
            >
              {report.type}
            </Badge>
          </div>
          <DialogDescription className="flex items-center gap-2 text-gray-500 mt-1">
            <Tag className="size-4" />
            {report.category}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6 custom-scrollbar">
          <div className="space-y-6 pt-2">
            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="relative group rounded-2xl overflow-hidden bg-gray-50 border-2 border-gray-100 shadow-inner">
                {images.length > 1 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {images.map((url, index) => (
                        <CarouselItem key={index}>
                          <div className="aspect-video relative flex items-center justify-center bg-black/5">
                            <ImageWithFallback
                              src={url}
                              alt={`${report.itemName} - image ${index + 1}`}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm border-none shadow-lg hover:bg-white" />
                    <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm border-none shadow-lg hover:bg-white" />
                  </Carousel>
                ) : (
                  <div className="aspect-video relative flex items-center justify-center bg-black/5">
                    <ImageWithFallback
                      src={images[0]}
                      alt={report.itemName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xl px-1">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                Description
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 shadow-inner">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {report.description}
                </p>
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-blue-50 shadow-sm">
                <div className="bg-blue-500/10 p-3 rounded-2xl shrink-0">
                  <User className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">Reported By</p>
                  <p className="text-gray-900 font-bold text-lg">{report.userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-green-50 shadow-sm">
                <div className="bg-green-500/10 p-3 rounded-2xl shrink-0">
                  <MapPin className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-0.5">Location</p>
                  <p className="text-gray-900 font-bold text-lg">{report.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-purple-50 shadow-sm">
                <div className="bg-purple-500/10 p-3 rounded-2xl shrink-0">
                  <Calendar className="size-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-0.5">Date</p>
                  <p className="text-gray-900 font-bold text-lg">
                    {new Date(report.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-orange-50 shadow-sm">
                <div className="bg-orange-500/10 p-3 rounded-2xl shrink-0">
                  <Clock className="size-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">Status</p>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-bold text-lg capitalize">{report.status}</p>
                    {report.status === 'pending' && (
                      <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {!isOwner && report.status === "active" && (
          <DialogFooter className="p-6 bg-gray-50 border-t-2 border-gray-100 sm:justify-center">
            {report.type === "found" ? (
              <Button 
                onClick={(e) => {
                  onClose();
                  onClaim(e);
                }}
                className="w-full sm:max-w-md bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 shadow-xl transition-all duration-300 text-white font-bold py-7 text-lg group rounded-2xl"
              >
                <HandHeart className="size-6 mr-3 group-hover:scale-110 transition-transform" />
                I Lost This Item
              </Button>
            ) : (
              <Button 
                onClick={(e) => {
                  onClose();
                  onClaim(e);
                }}
                className="w-full sm:max-w-md bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-xl transition-all duration-300 text-white font-bold py-7 text-lg group rounded-2xl"
              >
                <HandHeart className="size-6 mr-3 group-hover:scale-110 transition-transform" />
                I Found This Item
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
