import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { Keyboard } from "react-native";
import { Haptics } from "@/lib/haptics";
import { Chapter } from "@/types";

export function useChapterSearch(chapters: Chapter[]) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce inputValue to update searchQuery
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (inputValue.trim() === "") {
      setSearchQuery("");
      return;
    }

    debounceTimer.current = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue]);

  // Handle clear search
  const handleClear = useCallback(() => {
    Haptics.medium();
    setInputValue("");
    setSearchQuery("");
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    Keyboard.dismiss();
  }, []);

  // Fuse.js fuzzy search configuration
  const fuse = useMemo(() => {
    if (!chapters.length) return null;
    return new Fuse(chapters, {
      keys: ["englishName", "englishTranslation", "name", "id"],
      threshold: 0.3,
      distance: 100,
    });
  }, [chapters]);

  // Filter chapters list based on debounced searchQuery
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return chapters;
    }
    if (!fuse) return [];
    return fuse.search(searchQuery).map((res) => res.item);
  }, [searchQuery, chapters, fuse]);

  return {
    inputValue,
    setInputValue,
    handleClear,
    searchQuery,
    filteredData,
  };
}
