import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { Keyboard } from "react-native";
import { useQuranData } from "./useQuranData";
import { Haptics } from "@/lib/haptics";

export function useQuranListSearch(selectedOption?: "read" | "listen") {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce inputValue to update searchQuery
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
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

  // Handle immediate clear
  const handleClear = useCallback(() => {
    Haptics.medium();
    setInputValue("");
    setSearchQuery("");
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    Keyboard.dismiss();
  }, []);

  // Fetch chapters
  const { data: quranData = [], isLoading, isError, refetch } = useQuranData();

  const fuse = useMemo(() => {
    if (!quranData.length) return null;
    return new Fuse(quranData, {
      keys: ["englishName", "englishTranslation", "name", "id"],
      threshold: 0.3,
      distance: 100,
    });
  }, [quranData]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return quranData;
    }
    if (!fuse) return [];
    return fuse.search(searchQuery).map((res) => res.item);
  }, [searchQuery, quranData, fuse]);

  return {
    inputValue,
    setInputValue,
    handleClear,
    searchQuery,
    chapters: quranData,
    filteredData,
    isLoading,
    isError,
    refetch,
  };
}
