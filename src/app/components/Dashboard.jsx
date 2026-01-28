import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select.jsx";
import { ItemCard } from "@/app/components/ItemCard.jsx";
import { ReportForm } from "@/app/components/ReportForm.jsx";
import { AuthForm } from "@/app/components/AuthForm.jsx";
import { NotificationPanel } from "@/app/components/NotificationPanel.jsx";
import { PlusCircle, Search, LogOut, Package } from "lucide-react";
import { toast } from "sonner";



export function Dashboard({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [lostResponse, foundResponse] = await Promise.all([
        fetch('http://localhost:3000/api/lost'),
        fetch('http://localhost:3000/api/found')
      ]);

      const lostData = await lostResponse.json();
      const foundData = await foundResponse.json();

      // Transform lost reports
      const lostReports = lostData.map(report => ({
        id: report.lost_id,
        type: 'lost',
        userId: report.creator_id,
        userName: report.creator_name,
        itemName: report.title,
        description: report.description,
        category: report.tags?.[0] || 'Other',
        location: report.location_name,
        date: report.lost_at,
        status: report.status,
        imageUrl: report.image_urls?.[0] || null,
        tags: report.tags || []
      }));

      // Transform found reports
      const foundReports = foundData.map(report => ({
        id: report.found_id,
        type: 'found',
        userId: report.creator_id,
        userName: report.creator_name,
        itemName: report.title,
        description: report.description,
        category: report.tags?.[0] || 'Other',
        location: report.location_name,
        date: report.found_at,
        status: report.status,
        imageUrl: report.image_urls?.[0] || null,
        tags: report.tags || []
      }));

      setReports([...lostReports, ...foundReports]);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (report) => {
    setShowReportForm(null);
    toast.success("Report submitted! Refreshing feed...");
    // Optimistically close form immediately, fetch in background
    fetchReports();
  };


  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.itemName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || report.category === filterCategory;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "my-reports" && report.userId === user.id) ||
      (activeTab === "lost" && report.type === "lost") ||
      (activeTab === "found" && report.type === "found");

    return matchesSearch && matchesCategory && matchesTab;
  });

  const categories = [
    "Electronics",
    "Clothing",
    "Books & Stationery",
    "Bags & Backpacks",
    "Keys",
    "Wallets & Purses",
    "Jewelry & Accessories",
    "Sports Equipment",
    "ID Cards & Documents",
    "Other",
  ];

  if (showReportForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto py-8">
          <ReportForm
            type={showReportForm}
            userId={user.id}
            onSubmit={handleSubmitReport}
            onCancel={() => setShowReportForm(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b-2 border-blue-100 shadow-lg sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-md">
                <Package className="size-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Campus Lost & Found
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Welcome back, <span className="font-semibold text-blue-600">{user.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationPanel userId={user.id} />
              <Button variant="outline" onClick={onLogout} className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all shadow-sm">
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button 
            onClick={() => setShowReportForm("lost")} 
            className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="size-4 mr-2" />
            Report Lost Item
          </Button>
          <Button 
            onClick={() => setShowReportForm("found")} 
            className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="size-4 mr-2" />
            Report Found Item
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by item name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-56 border-gray-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">All Items</TabsTrigger>
            <TabsTrigger value="lost" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Lost</TabsTrigger>
            <TabsTrigger value="found" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Found</TabsTrigger>
            <TabsTrigger value="my-reports" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">My Reports</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-md">
                <div className="size-16 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Loading reports...</p>
                <p className="text-sm text-gray-400 mt-1">Please wait while we fetch the latest items</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-md border-2 border-dashed border-gray-200">
                <div className="bg-gray-100 rounded-full size-20 mx-auto mb-4 flex items-center justify-center">
                  <Package className="size-10 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-1">No items found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report, index) => (
                  <div key={report.id ?? index} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms`, animationDuration: '400ms', animationFillMode: 'backwards' }}>
                    <ItemCard
                      report={report}
                      currentUserId={user.id}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
