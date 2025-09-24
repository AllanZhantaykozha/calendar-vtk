"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Event } from "@/components/types/event.type";
import { Category } from "@/components/types/category.type";
import { toast } from "sonner";

export default function AdminPanel() {
  // State for events
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Load events and categories
  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки мероприятий");
        return res.json();
      })
      .then((data) => setEvents(data))
      .catch((err: Error) => {
        console.error("Ошибка загрузки мероприятий:", err);
        setError("Не удалось загрузить мероприятия");
      });

    fetch("/api/category")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки категорий");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      })
      .catch((err: Error) => {
        console.error("Ошибка загрузки категорий:", err);
        setError("Не удалось загрузить категории");
      });
  }, []);

  // Save event (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formattedDate = date ? new Date(date).toISOString() : "";

    const payload = {
      title,
      description,
      date: formattedDate,
      time,
      categoryId,
      id: selectedEvent?.id,
    };

    try {
      if (selectedEvent) {
        const res = await fetch("/api/events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Ошибка при обновлении события");
        }
        toast.success("Мероприятие обновлено!");
      } else {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Ошибка при создании события");
        }
        toast.success("Мероприятие создано!");
      }

      resetForm();
      const updated = await fetch("/api/events").then((res) => {
        if (!res.ok) throw new Error("Ошибка обновления списка мероприятий");
        return res.json();
      });
      setEvents(updated);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ошибка сохранения мероприятия";
      setError(message);
      toast.error(message);
    }
  };

  // Add or update category
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newCategory.trim()) {
      toast.warning("Название категории не может быть пустым");
      return;
    }

    try {
      if (editingCategory) {
        const res = await fetch("/api/category", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCategory.id, name: newCategory }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Ошибка при обновлении категории");
        }
        toast.success("Категория обновлена!");
      } else {
        const res = await fetch("/api/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategory }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Ошибка при добавлении категории");
        }
        toast.success("Категория добавлена!");
      }

      const updated = await fetch("/api/category").then((res) => {
        if (!res.ok) throw new Error("Ошибка обновления списка категорий");
        return res.json();
      });
      setCategories(updated);
      setNewCategory("");
      setEditingCategory(null);
      if (updated.length > 0 && !categoryId) setCategoryId(updated[0].id);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ошибка при обработке категории";
      setError(message);
      toast.error(message);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    setError(null);
    try {
      const res = await fetch("/api/category", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка при удалении категории");
      }

      const updated = await fetch("/api/category").then((res) => {
        if (!res.ok) throw new Error("Ошибка обновления списка категорий");
        return res.json();
      });
      setCategories(updated);
      if (categoryId === id) setCategoryId(updated[0]?.id || "");
      setEditingCategory(null);
      toast.success("Категория удалена!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Ошибка удаления категории";
      setError(message);
      toast.error(message);
    }
  };

  // Edit category
  const handleEditCategory = (category: Category) => {
    setNewCategory(category.name);
    setEditingCategory(category);
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setCategoryId(categories[0]?.id || "");
    setSelectedEvent(null);
  };

  // Edit event
  const handleEdit = (event: Event) => {
    setTitle(event.title);
    setDescription(event.description);
    setDate(new Date(event.date).toISOString().split("T")[0]);
    setTime(event.time);
    setCategoryId(event.category.id);
    setSelectedEvent(event);
  };

  // Delete event
  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка при удалении события");
      }

      const updated = await fetch("/api/events").then((res) => {
        if (!res.ok) throw new Error("Ошибка обновления списка мероприятий");
        return res.json();
      });
      setEvents(updated);
      if (selectedEvent && selectedEvent.id === id) resetForm();
      toast.success("Мероприятие удалено!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Ошибка удаления мероприятия";
      setError(message);
      toast.error(message);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (!res.ok) throw new Error("Ошибка выхода из системы");
      router.replace("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Не удалось выйти из системы";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex justify-between w-full">
            <button
              onClick={() => router.push("/")}
              className="text-xl font-bold"
            >
              Календарь
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <LogOut />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold tracking-tight text-center pb-10">
          Админ-панель
        </h1>
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3">
            {/* Event form */}
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {selectedEvent
                ? "Редактировать мероприятие"
                : "Создать мероприятие"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg shadow-md mb-6"
            >
              <div className="mb-4">
                <label className="block font-medium text-gray-700">
                  Название
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">
                  Описание
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Дата</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Время</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">
                  Категория
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
                >
                  {selectedEvent ? "Обновить" : "Создать"}
                </button>
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
                  >
                    Отменить
                  </button>
                )}
              </div>
            </form>

            {/* Category form */}
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingCategory
                ? "Редактировать категорию"
                : "Создать категорию"}
            </h2>
            <form
              onSubmit={handleCategorySubmit}
              className="bg-white p-6 rounded-lg shadow-md mb-6"
            >
              <div className="mb-4">
                <label className="block font-medium text-gray-700">
                  Название категории
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
                >
                  {editingCategory
                    ? "Обновить категорию"
                    : "Добавить категорию"}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory("");
                      setEditingCategory(null);
                    }}
                    className="w-full bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
                  >
                    Отменить
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Event and Category lists */}
          <div className="w-full lg:w-1/3">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Список мероприятий
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md h-[600px] overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center">Нет мероприятий</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="mb-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <h3 className="font-semibold text-gray-800">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Дата: {new Date(event.date).toLocaleDateString("ru-RU")}
                    </p>
                    <p className="text-sm text-gray-600">
                      Категория: {event.category.name}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-800 my-6">
              Список категорий
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md h-[400px] overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center">Нет категорий</p>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="mb-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <h3 className="font-semibold text-gray-800">
                      {category.name}
                    </h3>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
