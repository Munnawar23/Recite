import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { AppTextInput } from "@/components";
import { useAppFonts } from "@/hooks/useAppFonts";
import { useAppTheme } from "@/hooks/useAppTheme";
import { type ThemeColors, type ThemeSpacing } from "@/theme";

interface SearchBarInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  testID?: string;
}

export const SearchBar = React.memo(function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search Surah...",
  testID = "search-bar",
}: SearchBarInputProps) {
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const styles = useMemo(
    () => createStyles(colors, fontFamily, fontSize, spacing),
    [colors, fontFamily, fontSize, spacing],
  );

  const hitSlop = useMemo(
    () => ({
      top: spacing.sm,
      bottom: spacing.sm,
      left: spacing.sm,
      right: spacing.sm,
    }),
    [spacing.sm],
  );

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={spacing.xl}
          color={colors.subtext}
          style={styles.searchIcon}
        />
        <AppTextInput
          testID={`${testID}-input`}
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={colors.subtext}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityRole="search"
          accessibilityLabel={placeholder}
        />
        {value.length > 0 && (
          <Pressable
            testID={`${testID}-clear-button`}
            onPress={onClear}
            style={styles.clearButton}
            hitSlop={hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle"
              size={spacing.lg}
              color={colors.subtext}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
});

export default SearchBar;

type AppFonts = ReturnType<typeof useAppFonts>;

const createStyles = (
  colors: ThemeColors,
  fontFamily: AppFonts["fontFamily"],
  fontSize: AppFonts["fontSize"],
  spacing: ThemeSpacing,
) =>
  StyleSheet.create({
    searchContainer: {
      paddingHorizontal: spacing.screenPadding,
      marginBottom: spacing.vXs,
      marginTop: spacing.vXs,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: spacing.md,
      height: spacing.xxxl + spacing.md,
      paddingHorizontal: spacing.sm,
    },
    searchIcon: {
      marginRight: spacing.sm,
      alignSelf: "center",
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      height: "100%",
      padding: 0,
      textAlignVertical: "center",
    },
    clearButton: {
      padding: spacing.xs,
      alignSelf: "center",
    },
  });
