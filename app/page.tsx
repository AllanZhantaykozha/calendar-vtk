"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelRight, ShieldUser } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Category } from "@/components/types/category.type";
import { Event } from "@/components/types/event.type";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("Ошибка проверки авторизации");
        const data = await res.json();
        setIsLoggedIn(data.isLoggedIn || false);
      } catch (e) {
        console.error("Ошибка проверки авторизации:", e);
        setIsLoggedIn(false);
      }
    }

    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("Ошибка загрузки мероприятий");
        const data = await res.json();
        setEvents(data);
      } catch (e) {
        console.error("Ошибка загрузки мероприятий:", e);
        setError("Не удалось загрузить мероприятия");
      }
    }

    async function fetchCategories() {
      try {
        const res = await fetch("/api/category");
        if (!res.ok) throw new Error("Ошибка загрузки категорий");
        const data = await res.json();
        setCategories(data);
      } catch (e) {
        console.error("Ошибка загрузки категорий:", e);
        setError("Не удалось загрузить категории");
      }
    }

    checkAuth();
    fetchEvents();
    fetchCategories();
  }, [router]);

  const filteredEvents = [...events]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((event) => {
      const matchesCategory =
        category === "all" || event.category.name === category;
      const matchesTitle = event.title
        .toLowerCase()
        .includes(searchTitle.toLowerCase());
      const eventDate = new Date(event.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const matchesDate =
        (!start || eventDate >= start) && (!end || eventDate <= end);

      return matchesCategory && matchesTitle && matchesDate;
    });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)}>
              <PanelRight color="white" size={32} />
            </button>
          </div>
          <h1 className="text-sm font-bold tracking-tight lg:text-2xl">
            Календарь мероприятий ВТК-К
          </h1>
          <div>
            {!isLoggedIn ? (
              <button onClick={() => router.push("/login")}>
                <ShieldUser color="white" size={32} />
              </button>
            ) : (
              <button onClick={() => router.push("/admin")}>
                <ShieldUser color="white" size={32} />
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6 flex-1">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={`${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 rounded-r-xl transition-transform duration-300 ease-in-out z-30
              lg:static lg:translate-x-0 lg:w-64 lg:h-auto lg:rounded-xl lg:shadow-md lg:border lg:border-gray-200`}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Фильтры
            </h2>
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label
                  htmlFor="searchTitle"
                  className="block font-medium text-gray-700"
                >
                  Поиск по названию:
                </label>
                <input
                  id="searchTitle"
                  type="text"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Введите название..."
                />
              </div>
              {/* Date filters */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block font-medium text-gray-700"
                >
                  Дата начала:
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block font-medium text-gray-700"
                >
                  Дата окончания:
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Category filter */}
              <div>
                <label
                  htmlFor="category"
                  className="block font-medium text-gray-700"
                >
                  Категория:
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Все</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="mt-6 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition lg:hidden"
            >
              Закрыть
            </button>
          </aside>

          {/* Content */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center">
                  Нет мероприятий
                </p>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="cursor-pointer bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition flex flex-col justify-between min-h-[220px]"
                  >
                    <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">
                      {event.title}
                    </h2>
                    <p className="text-gray-600 mt-2 line-clamp-3">
                      {event.description}
                    </p>
                    <div className="mt-auto pt-4 text-sm">
                      <p className="text-gray-500">
                        Дата: {new Date(event.date).toLocaleDateString("ru-RU")}
                      </p>
                      <p className="text-gray-500">Время: {event.time}</p>
                      <p className="text-indigo-600 font-medium mt-1">
                        Категория: {event.category.name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-indigo-600">
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-700">{selectedEvent.description}</p>
                <p className="text-gray-500">
                  <span className="font-medium">Дата:</span>{" "}
                  {new Date(selectedEvent.date).toLocaleDateString("ru-RU")}
                </p>
                <p className="text-gray-500">
                  <span className="font-medium">Время:</span>{" "}
                  {selectedEvent.time}
                </p>
                <p className="text-gray-500">
                  <span className="font-medium">Категория:</span>{" "}
                  {selectedEvent.category.name}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
