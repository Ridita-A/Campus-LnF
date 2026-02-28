import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Calendar, Upload, Loader2, X } from "lucide-react";
import { supabase } from "../../supabase";
import { toast } from "sonner";

export function ReportForm({ type, userId, onSubmit, onCancel }) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [locations, setLocations] = useState([]);
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Generate previews when imageFiles changes
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Clean up previews to avoid memory leaks
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase.rpc('get_locations');
      if (error) console.error('Error fetching locations:', error);
      else setLocations(data);
    };

    const fetchTags = async () => {
      const { data, error } = await supabase.rpc('get_tags');
      if (error) console.error('Error fetching tags:', error);
      else setTags(data);
    };

    fetchLocations();
    fetchTags();
  }, []);

  const handleRemoveImage = (indexToRemove) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation for found reports
    if (type === 'found' && imageFiles.length === 0) {
      toast.error('Found reports MUST include at least one clear image of the item');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Upload images and get public URLs
      const imageUrls = [];
      if (imageFiles.length > 0) {
        toast.info('Uploading images...');
        for (const file of imageFiles) {
          const fileName = `${type}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("lnf-images")
            .upload(fileName, file);
          
          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            continue;
          }

          const { data } = supabase.storage.from("lnf-images").getPublicUrl(fileName);
          if (data?.publicUrl) imageUrls.push(data.publicUrl);
        }
      }

      // 2. Create report object
      const report = {
        creator_id: userId,
        title: itemName,
        description,
        tags: [parseInt(category)],
        image_urls: imageUrls,
      };

      if (type === 'lost') {
        report.last_location_id = parseInt(location);
        report.lost_at = new Date(date).toISOString();
      } else {
        report.found_location_id = parseInt(location);
        report.found_at = new Date(date).toISOString();
      }

      // 3. Send to backend API
      const endpoint = type === 'lost' ? '/api/lost/create' : '/api/found/create';
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create report');
      }

      // Success - immediately call onSubmit without waiting
      onSubmit(report);
    } catch (err) {
      console.error('Error submitting report:', err);
      toast.error(err.message || 'Failed to submit report');
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {type === "lost" ? "Report Lost Item" : "Report Found Item"}
        </CardTitle>
        <CardDescription>
          {type === "lost"
            ? "Help us find your lost item by providing details"
            : "Help reunite someone with their lost item"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-3">
            <Label htmlFor="images" className="text-base font-semibold flex items-center gap-2">
              <Upload className="size-4 text-blue-600" />
              Item Images {type === 'found' && <span className="text-red-500">*</span>}
            </Label>
            <div 
              className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 group cursor-pointer
                ${type === 'found' && imageFiles.length === 0 ? 'border-red-200 bg-red-50/30 hover:border-red-400' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'}`}
              onClick={() => document.getElementById('images').click()}
            >
              <Input
                id="images"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setImageFiles(prev => [...prev, ...files]);
                  e.target.value = ''; // Reset value to allow re-selection
                }}
                accept="image/*"
              />
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className={`p-4 rounded-full transition-colors ${type === 'found' && imageFiles.length === 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  <Upload className="size-8" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    Click to upload images
                  </p>
                  <p className="text-sm text-gray-500 mt-1.5 max-w-xs mx-auto">
                    {type === 'found' 
                      ? "Found items MUST have at least one clear image for verification" 
                      : "Add clear photos to help people recognize the item"}
                  </p>
                </div>
              </div>
            </div>

            {imageFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-100 animate-in fade-in duration-500">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg group border-2 border-white shadow-md hover:shadow-xl transition-all duration-300">
                    <img
                      src={previews[index]}
                      alt={`Preview ${index}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 hover:scale-110 transition-all shadow-lg active:scale-95"
                      >
                        <X className="size-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="item-name">Title</Label>
            <Input
              id="item-name"
              type="text"
              placeholder="e.g., Black iPhone 13"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem key={tag.tag_id} value={tag.tag_id.toString()}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed description (color, brand, unique features, etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{type === "lost" ? "Last Seen Location" : "Found Location"}</Label>
            <Select value={location} onValueChange={setLocation} required>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.location_id} value={loc.location_id.toString()}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{type === "lost" ? "Date Lost" : "Date Found"}</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}