import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Calendar, Upload, Loader2 } from "lucide-react";
import { supabase } from "../../supabase";
import { toast } from "sonner";

export function ReportForm({ type, userId, onSubmit, onCancel }) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setImageFiles((prevFiles) => {
      const newFiles = prevFiles.filter((_, index) => index !== indexToRemove);
      // Revoke the URL of the removed file to free up memory
      if (prevFiles[indexToRemove]) {
        URL.revokeObjectURL(URL.createObjectURL(prevFiles[indexToRemove]));
      }
      return newFiles;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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

          <div className="space-y-2">
            <Label htmlFor="images">Images</Label>
            <Input
              id="images"
              type="file"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
              required={type === 'found'}
            />
            {imageFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative w-full h-24 overflow-hidden rounded-md group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      onLoad={() => URL.revokeObjectURL(file.preview)} // Clean up memory
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-Black-500 text-Black rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      X
                    </button>
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