import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAppFonts } from "@/hooks/useAppFonts";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ThemeColors } from "@/theme/colors";
import { ThemeSpacing } from "@/theme/spacing";

interface SearchBarInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search Surah...",
}: SearchBarInputProps) {
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const S = createStyles(colors, fontFamily, fontSize, spacing);

  return (
    <View style={S.searchContainer}>
      <View style={S.searchBar}>
        <Ionicons
          name="search"
          size={spacing.xl}
          color={colors.subtext}
          style={S.searchIcon}
        />
        <TextInput
          style={S.searchInput}
          placeholder={placeholder}
          placeholderTextColor={colors.subtext}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={onClear}
            style={S.clearButton}
            hitSlop={{
              top: spacing.sm,
              bottom: spacing.sm,
              left: spacing.sm,
              right: spacing.sm,
            }}
          >
            <Ionicons
              name="close-circle"
              size={spacing.lg}
              color={colors.subtext}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

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
