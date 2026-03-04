import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/app/components/ui/dialog.jsx";
import { User, Mail, Phone, IdCard, Package, ClipboardList, HandHeart, RotateCcw, Search, } from "lucide-react";
import { toast } from "sonner";
import { ItemDetailModal } from "@/app/components/ItemDetailModal.jsx";

const TYPE_CONFIG = {
  lost: {
    label: "Lost Report",
    icon: Package,
    color: "bg-red-100 text-red-700 border-red-200",
  },
  found: {
    label: "Found Report",
    icon: Search,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  claim: {
    label: "Claim Request",
    icon: HandHeart,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  return: {
    label: "Return Request",
    icon: RotateCcw,
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
};

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-700 border-blue-200" },
  expired: { label: "Expired", color: "bg-orange-100 text-orange-700 border-orange-200" },
  archived: { label: "Archived", color: "bg-gray-100 text-gray-600 border-gray-200" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  accepted: { label: "Accepted", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    color: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || {
    label: type,
    color: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const Icon = cfg.icon || Package;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

export function ReporterProfileModal({ isOpen, onClose, userId }) {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [historyFilter, setHistoryFilter] = useState("all");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
      fetchHistory();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch(`http://localhost:3000/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reporter profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch(`http://localhost:3000/api/users/${userId}/history`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      // Filter out archived posts since these are meant to be private
      const publicHistory = data.filter((item) => item.status !== "archived");
      setHistory(publicHistory);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load report history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const mapHistoryToReport = (item) => ({
    id: `${item.report_type}-${item.history_id}`,
    dbId: item.history_id,
    type: item.report_type,
    itemName: item.title || "Untitled",
    description: item.description || "",
    location: item.location_name || "Unknown location",
    date: item.reported_at,
    status: item.status,
    imageUrl: item.image_url || null,
    imageUrls: item.image_url ? [item.image_url] : [],
    category: item.category,
    userId: userId,
    userName: profile?.name || item.creator_name || "",
  });

  const getInitials = (name) =>
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const filteredHistory =
    historyFilter === "all"
      ? history
      : history.filter((h) => h.report_type === historyFilter);

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl sm:max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col border-none shadow-2xl bg-gray-50">
          <DialogHeader className="p-6 pb-4 bg-white border-b border-gray-100">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="size-6 text-blue-600" />
              Reporter Profile
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-8">
            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500" />
              {loadingProfile ? (
                 <div className="flex justify-center py-12">
                   <div className="size-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                 </div>
              ) : profile ? (
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="shrink-0">
                      <div className="size-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                        <span className="text-white text-2xl font-bold tracking-wide">
                          {getInitials(profile.name)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                            <User className="size-3.5" /> Full Name
                          </label>
                          <p className="font-semibold text-gray-900">{profile.name}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                            <Mail className="size-3.5" /> Email
                          </label>
                          <p className="font-medium text-gray-700">{profile.email}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                            <IdCard className="size-3.5" /> Student ID
                          </label>
                          <p className="font-medium text-gray-700">{profile.student_id}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                            <Phone className="size-3.5" /> Contact Number
                          </label>
                          <p className="font-medium text-gray-700">
                            {profile.contact_number || <span className="text-gray-400 italic">Not provided</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">Failed to load profile.</div>
              )}
            </div>

            {/* History Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="h-1.5 bg-gradient-to-r from-purple-500 via-blue-400 to-indigo-500" />
               <div className="p-6">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                   <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                     <ClipboardList className="size-5 text-blue-600" />
                     Public Activity
                   </h2>

                   <div className="flex gap-1 bg-white p-1.5 rounded-xl shadow border-2 border-gray-200 flex-wrap">
                      {[
                        { value: "all",    label: "All",     base: "bg-blue-50 text-blue-700 hover:bg-blue-100",      activeGrad: "linear-gradient(to right, #3b82f6, #2563eb)" },
                        { value: "lost",   label: "Lost",    base: "bg-red-50 text-red-700 hover:bg-red-100",          activeGrad: "linear-gradient(to right, #ef4444, #dc2626)" },
                        { value: "found",  label: "Found",   base: "bg-green-50 text-green-700 hover:bg-green-100",    activeGrad: "linear-gradient(to right, #22c55e, #16a34a)" },
                        { value: "claim",  label: "Claims",  base: "bg-purple-50 text-purple-700 hover:bg-purple-100", activeGrad: "linear-gradient(to right, #a855f7, #9333ea)" },
                        { value: "return", label: "Returns", base: "bg-orange-50 text-orange-700 hover:bg-orange-100",       activeGrad: "linear-gradient(to right, #f97316, #ea580c)" },
                      ].map((f) => {
                        const isActive = historyFilter === f.value;
                        return (
                          <button
                            key={f.value}
                            onClick={() => setHistoryFilter(f.value)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${isActive ? "text-white shadow-md" : f.base}`}
                            style={isActive ? { backgroundImage: f.activeGrad } : {}}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                   </div>
                 </div>

                  {loadingHistory ? (
                    <div className="flex justify-center py-12">
                      <div className="size-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : filteredHistory.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                      <ClipboardList className="size-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No public activity found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {historyFilter !== "all" ? `No ${historyFilter} records.` : "This user has not posted any public reports yet."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredHistory.map((item, idx) => {
                        const typeCfg = TYPE_CONFIG[item.report_type] || {};
                        return (
                          <div
                            key={`${item.report_type}-${item.history_id}-${idx}`}
                            onClick={() => setSelectedHistoryItem(item)}
                            className="flex gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
                          >
                            <div className="shrink-0 size-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="size-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                (() => {
                                  const Icon = typeCfg.icon || Package;
                                  return <Icon className="size-6 text-gray-400" />;
                                })()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <TypeBadge type={item.report_type} />
                                  <StatusBadge status={item.status} />
                                </div>
                                <p className="font-semibold text-gray-900 truncate text-sm">
                                  {item.title || <span className="text-gray-400 italic">Untitled</span>}
                                </p>
                                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                  {item.reported_at && (
                                    <span>
                                      {new Date(item.reported_at).toLocaleDateString("en-US", {
                                        timeZone: "UTC", year: "numeric", month: "short", day: "numeric",
                                      })}
                                    </span>
                                  )}
                                </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested detail modal if user clicks on an item in history */}
      {selectedHistoryItem && (
        <ItemDetailModal
          isOpen={!!selectedHistoryItem}
          onClose={() => setSelectedHistoryItem(null)}
          report={mapHistoryToReport(selectedHistoryItem)}
          currentUserId={null} // Don't allow claims from this nested view maybe?
          onClaim={() => {}} // No-op
        />
      )}
    </>
  );
}
