# 🎨 Typography & Text System

A complete reference guide for typography variants, font scaling, color tokens, and text props used throughout the app.

---

## 📊 1. The 10 Typography Variants

All sizes are dynamically scaled for mobile screens using `rs.font(...)`.

| # | Variant (`variant`) | Font Size (`fontSize`) | Default Font Family | Primary Use Case |
|---|---------------------|------------------------|---------------------|------------------|
| 1 | `caption`           | **12px**               | `Nunito-Medium`     | Timestamps, badges, secondary notes |
| 2 | `bodySm`            | **13px**               | `Nunito-Medium`     | Helper descriptions, minor labels |
| 3 | `body` *(default)*  | **14px**               | `Nunito-Medium`     | Standard body text, card subtitles |
| 4 | `bodyLg`            | **15px**               | `Nunito-Medium`     | Prominent body text, Surah names |
| 5 | `title`             | **17px**               | `Nunito-SemiBold`   | Settings cards, subheaders |
| 6 | `heading`           | **18px**               | `PlusJakartaSans-Bold` | Section headers, modal titles |
| 7 | `cardTitle`         | **19px**               | `Nunito-SemiBold`   | Major card headers |
| 8 | `arabic`            | **27px**               | `Amiri-Bold`        | Quranic Arabic verse text |
| 9 | `largeTitle`        | **28px**               | `PlusJakartaSans-Bold` | Main screen titles |
| 10| `splashTitle`       | **29px**               | `PlusJakartaSans-Bold` | Splash screen & branding |

> **💡 Natural Line Spacing & Kerning:**  
> `AppText` uses natural OS font metrics for all variants by default. Rigid default `lineHeight` and `letterSpacing` are intentionally excluded to prevent text clipping, line truncations, and broken ligatures across different languages (Hindi, Arabic, English) and accessibility font sizes.  
> Special components requiring custom spacing (e.g. Quran recitation lines) can supply `lineHeight` directly via `style={{ lineHeight: ... }}`.

---

## 🎨 2. Color System (`color` prop)

`<AppText />` accepts theme color tokens or any custom hex/rgba string. Theme tokens automatically adapt between Light Mode and Dark Mode:

| Color Token | Light Mode Role | Dark Mode Role | Typical Use |
|-------------|-----------------|----------------|-------------|
| `text` *(default)* | Slate Charcoal (`#1E293B`) | Soft Off-White (`#E6ECEF`) | Primary reading copy & card titles |
| `subtext` | Dark Slate Gray (`#475569`) | Bright Slate (`#BDCBDB`) | Metadata, verse counts, descriptions |
| `primary` | Soft Sage Green (`#4B8566`) | Warm Gold (`#D4A86A`) | Active accents, badge numbers, icons |
| `quranVerse` | Sage-Forest (`#355E46`) | Soft Amber (`#E4B87C`) | Arabic Quran verses & translation focus |
| `accent` | Warm Gold (`#B8823D`) | Warm Gold (`#D4A86A`) | Highlights, tags |
| `card` | White (`#FFFFFF`) | Dark Slate (`#192223`) | Card background color |
| `background` | Warm Parchment (`#F5F1EA`) | Charcoal (`#121415`) | Root container background |
| `border` | Parchment Border (`#E2DCD2`) | Subtle Border (`#1E2B2C`) | Dividers and borders |
| *Custom string* | Any Hex (`#FF0000`) or RGBA (`rgba(255,255,255,0.8)`) | Custom override |

---

## 🔤 3. Font Families & Weights

The app bundles 4 custom font files:

| Family Token | Loaded Font File | Default Weight | Recommended Role |
|--------------|------------------|----------------|------------------|
| `heading` / `bold` | `PlusJakartaSans-Bold.ttf` | `700` (Bold) | Screen headers & hero titles |
| `title` / `semiBold` | `Nunito-SemiBold.ttf` | `600` (SemiBold) | Card titles, buttons, tags |
| `regular` / `medium` / `text` | `Nunito-Medium.ttf` | `500` (Medium) | Body text, subtitles, meta |
| `quran` / `arabic` | `Amiri-Bold.ttf` | `700` (Bold) | Arabic Quran verses |

### Direct Weight Support:
You can pass weights directly through props without using inline styles:
- **String Weights**: `fontWeight="700"`, `fontWeight="600"`, `fontWeight="500"`, `fontWeight="bold"`
- **Boolean Flags**: `<AppText bold />`, `<AppText semiBold />`, `<AppText medium />`

---

## ⚙️ 4. Full `<AppText />` Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `TextVariant` | `'body'` | Typography preset (size and default font family) |
| `color` | `TextColor` | `'text'` | Theme color token or `#hex` / `rgba(...)` string |
| `weight` / `fontWeight` | `string` | *preset default* | Numeric weight (`"400"`, `"500"`, `"600"`, `"700"`) |
| `family` / `fontFamily` | `TextWeight` | *preset default* | `'heading'`, `'title'`, `'regular'`, `'quran'` |
| `bold` / `semiBold` / `medium` | `boolean` | `false` | Shorthand weight flags |
| `size` | `number \| TextVariant` | *preset size* | Override font size (automatically scaled if number) |
| `align` | `TextStyle['textAlign']` | `'left'` | `'left'`, `'center'`, `'right'`, `'justify'` |
| `numberOfLines` | `number` | `undefined` | Truncate text after specified line count |
| `maxFontSizeMultiplier` | `number` | `1.2` | Caps OS accessibility zoom to prevent layout breakage |
| `ellipsizeMode` | `string` | `'tail'` | Ellipsis truncation position (`'tail'`, `'middle'`, etc.) |
| `style` | `StyleProp<TextStyle>` | `undefined` | Custom React Native text styles (e.g. custom `lineHeight`, `letterSpacing`) |

---

## 💻 5. Practical Code Examples

```tsx
import { AppText } from "@/components";

// 1. Standard body text
<AppText>Standard reading text with automatic theme color</AppText>

// 2. Settings / card title with custom color
<AppText variant="title" color="text">
  Display Options
</AppText>

// 3. Subtitle with subtext color, center alignment, and single line limit
<AppText variant="body" color="subtext" align="center" numberOfLines={1}>
  Theme & font sizes
</AppText>

// 4. Quran Surah name with bold weight
<AppText variant="bodyLg" family="title" fontWeight="700" color="primary">
  Al-Baqarah
</AppText>

// 5. Quran Arabic verse text with custom lineHeight via style
<AppText
  variant="arabic"
  family="quran"
  color="quranVerse"
  align="center"
  style={{ lineHeight: 54, letterSpacing: 2.5 }}
>
  الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
</AppText>

// 6. Custom color and size override
<AppText size={16} color="rgba(255, 255, 255, 0.85)" bold>
  Custom text with override
</AppText>
```
