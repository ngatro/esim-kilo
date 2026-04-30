"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Promotion {
  id: number;
  title: string;
  imageUrl: string;
  link: string | null;
  isActive: boolean;
  priority: number;
  badge: string | null;
  startDate: string | null;
  endDate: string | null;
}

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  // Check auth
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => {
        if (!res.ok) {
          router.push("/login");
        }
        return res.json();
      })
      .then(data => {
        if (!data.user || data.user.role !== "admin") {
          router.push("/");
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/promotions", {
        credentials: 'include'
      });
      const data = await res.json();
      setPromotions(data.promotions || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(formData: FormData) {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Promotion saved successfully!" });
        fetchData();
        setShowModal(false);
        setEditingPromo(null);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to save" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      const res = await fetch(`/api/admin/promotions?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Deleted successfully!" });
        fetchData();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  }

  async function handleToggleActive(promo: Promotion) {
    const formData = new FormData();
    formData.append("id", promo.id.toString());
    formData.append("title", promo.title);
    formData.append("link", promo.link || "");
    formData.append("isActive", (!promo.isActive).toString());
    formData.append("priority", promo.priority.toString());

    await handleSave(formData);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const title = formData.get("title") as string;
    if (!title) {
      setMessage({ type: "error", text: "Title is required" });
      return;
    }

    handleSave(formData);
  }

  function openAddModal() {
    setEditingPromo(null);
    setShowModal(true);
  }

  function openEditModal(promo: Promotion) {
    setEditingPromo(promo);
    setShowModal(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manage Promotions</h1>
            <p className="text-slate-600">Create promotional banners/popups for the homepage</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Add Promotion
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
          </div>
        )}

        {/* Promotions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map(promo => (
            <div key={promo.id} className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="relative h-40 bg-slate-100">
                {promo.imageUrl ? (
                  <Image src={promo.imageUrl} alt={promo.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${promo.isActive ? "bg-green-500 text-white" : "bg-slate-500 text-white"}`}>
                    {promo.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-800 mb-1">{promo.title}</h3>
                <p className="text-sm text-slate-500 mb-2">Priority: {promo.priority}</p>
                {promo.link && (
                  <p className="text-sm text-blue-500 truncate mb-2">{promo.link}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(promo)}
                    className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(promo)}
                    className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200"
                  >
                    {promo.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {promotions.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No promotions yet. Click &quot;Add Promotion&quot; to create one.
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {editingPromo ? "Edit Promotion" : "New Promotion"}
              </h2>

              <form onSubmit={handleSubmit}>
                <input type="hidden" name="id" value={editingPromo?.id || ""} />

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingPromo?.title || ""}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="Summer Sale 50% Off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/jpeg,image/png,image/jpg"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                    {editingPromo?.imageUrl && (
                      <p className="text-sm text-slate-500 mt-1">Current: {editingPromo.imageUrl}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link (optional)</label>
                    <input
                      type="url"
                      name="link"
                      defaultValue={editingPromo?.link || ""}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="https://example.com/promo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Badge (optional)</label>
                    <input
                      type="text"
                      name="badge"
                      defaultValue={editingPromo?.badge || ""}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="50% OFF, FREE SHIP, LIMITED TIME"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <input
                      type="number"
                      name="priority"
                      defaultValue={editingPromo?.priority || 0}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Active</label>
                    <select
                      name="isActive"
                      defaultValue={editingPromo?.isActive ? "true" : "false"}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingPromo(null);
                      }}
                      className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}