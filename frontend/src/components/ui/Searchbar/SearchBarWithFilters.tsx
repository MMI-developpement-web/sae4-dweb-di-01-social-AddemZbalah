import { useState } from "react";
import { searchPosts } from "../../../lib/api";
import Searchbar from "./searchbar";

interface SearchFilters {
  type: "tweet" | "user" | "hashtag";
  dateFrom?: string;
  dateTo?: string;
}

interface SearchBarWithFiltersProps {
  onResultsUpdate?: (results: any) => void;
  onSearch?: (query: string, filters: SearchFilters) => void;
}

export function SearchBarWithFilters({
  onResultsUpdate,
  onSearch,
}: SearchBarWithFiltersProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    type: "tweet",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!query.trim()) return;

    try {
      setLoading(true);
      const results = await searchPosts(query, {
        type: filters.type,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });
      onResultsUpdate?.(results);
      onSearch?.(query, filters);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Searchbar
            placeholder="Rechercher des tweets, utilisateurs, hashtags..."
            value={query}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            variant="subtle"
            size="md"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-full border border-secondary/30 text-secondary hover:bg-secondary/10 transition-colors"
          title="Afficher les filtres"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "Rechercher"}
        </button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-black/20 border border-secondary/20 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-secondary text-sm font-medium mb-2">
              Type de recherche
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value as "tweet" | "user" | "hashtag",
                })
              }
              className="w-full bg-black/30 border border-secondary/30 rounded px-3 py-2 text-secondary focus:outline-none focus:border-primary"
            >
              <option value="tweet">Tweets</option>
              <option value="user">Utilisateurs (@)</option>
              <option value="hashtag">Hashtags (#)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-secondary text-sm font-medium mb-2">
                À partir du
              </label>
              <input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateFrom: e.target.value || undefined,
                  })
                }
                className="w-full bg-black/30 border border-secondary/30 rounded px-3 py-2 text-secondary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-secondary text-sm font-medium mb-2">
                Jusqu'au
              </label>
              <input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateTo: e.target.value || undefined,
                  })
                }
                className="w-full bg-black/30 border border-secondary/30 rounded px-3 py-2 text-secondary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setFilters({ type: "tweet" });
              setShowFilters(false);
            }}
            className="w-full px-3 py-2 text-secondary/70 hover:text-secondary text-sm transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
