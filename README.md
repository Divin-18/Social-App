# React Native & Expo Course

A comprehensive guide to building mobile apps with React Native and Expo — from zero to a fully functional BeReal clone with authentication, image uploads, and real-time posts.

---

## Table of Contents

- [Part 1: React Native Fundamentals](#part-1-react-native-fundamentals)
  - [What is React Native?](#what-is-react-native)
  - [What is Expo?](#what-is-expo)
  - [Setting Up Your Environment](#setting-up-your-environment)
  - [Project Structure](#project-structure)
  - [Core Components](#core-components)
    - [View](#view)
    - [Text](#text)
    - [Image](#image)
    - [TextInput](#textinput)
    - [TouchableOpacity](#touchableopacity)
    - [FlatList](#flatlist)
    - [ScrollView](#scrollview)
    - [Modal](#modal)
    - [ActivityIndicator](#activityindicator)
    - [Alert](#alert)
    - [SafeAreaView](#safeareaview)
    - [RefreshControl](#refreshcontrol)
  - [Styling in React Native](#styling-in-react-native)
  - [React Hooks Review](#react-hooks-review)
    - [useState](#usestate)
    - [useEffect](#useeffect)
    - [useContext](#usecontext)
  - [Navigation with Expo Router](#navigation-with-expo-router)
    - [File-Based Routing](#file-based-routing)
    - [Layout Routes](#layout-routes)
    - [Route Groups](#route-groups)
    - [Tab Navigation](#tab-navigation)
    - [Programmatic Navigation](#programmatic-navigation)
  - [Working with Images](#working-with-images)
    - [expo-image](#expo-image)
    - [expo-image-picker](#expo-image-picker)
  - [State Management with Context API](#state-management-with-context-api)
  - [Environment Variables in Expo](#environment-variables-in-expo)
  - [TypeScript in React Native](#typescript-in-react-native)
- [Part 2: The BeReal Clone Project](#part-2-the-bereal-clone-project)
  - [Project Overview](#project-overview)
  - [Tech Stack](#tech-stack)
  - [App Architecture](#app-architecture)
  - [Database Schema](#database-schema)
  - [Authentication Flow](#authentication-flow)
  - [Posts System](#posts-system)
  - [File Storage](#file-storage)
  - [Route Protection](#route-protection)
  - [Getting Started](#getting-started)
  - [Project File Structure](#project-file-structure)

---

# Part 1: React Native Fundamentals

## What is React Native?

React Native is a framework created by Meta that lets you build **native mobile apps** using JavaScript and React. Unlike hybrid frameworks that render inside a web view, React Native compiles to actual native UI components — `UIView` on iOS and `android.view.View` on Android.

If you know React for the web, you already know about 80% of what you need. The main differences are:

- Instead of HTML elements (`div`, `span`, `p`), you use React Native components (`View`, `Text`, `Image`)
- Instead of CSS, you use JavaScript-based `StyleSheet` objects
- Instead of the DOM, you interact with native platform APIs

```jsx
// Web React
<div className="container">
  <p>Hello World</p>
</div>

// React Native
<View style={styles.container}>
  <Text>Hello World</Text>
</View>
```

## What is Expo?

Expo is a platform built on top of React Native that makes development significantly easier. Think of it as the "create-react-app" for mobile, but much more powerful.

**What Expo gives you:**

- **Expo CLI** — Start, build, and deploy your app
- **Expo Go** — Test your app on a real device by scanning a QR code
- **Expo SDK** — Pre-built libraries for camera, file system, notifications, etc.
- **Expo Router** — File-based routing (like Next.js for mobile)
- **EAS (Expo Application Services)** — Cloud builds and app store submissions

**Why use Expo instead of bare React Native?**

| Feature | Bare React Native | Expo |
|---------|-------------------|------|
| Setup time | 30+ min (Xcode, Android Studio) | 2 minutes |
| Native modules | Manual linking | Auto-configured |
| OTA updates | DIY | Built-in |
| Building for stores | Manual | One command (`eas build`) |

## Setting Up Your Environment

### Prerequisites

- Node.js 18+ installed
- A phone with **Expo Go** installed (iOS App Store / Google Play Store), or an iOS Simulator / Android Emulator

### Creating a New Project

```bash
# Create a new Expo project
npx create-expo-app@latest my-app

# Navigate into the project
cd my-app

# Start the development server
npx expo start
```

Scan the QR code with your phone (Expo Go app) or press `i` for iOS Simulator / `a` for Android Emulator.

## Project Structure

When you create a new Expo project, you get this structure:

```
my-app/
├── src/
│   ├── app/              # Screens and routes (Expo Router)
│   │   ├── _layout.tsx   # Root layout
│   │   └── index.tsx     # Home screen (/)
│   ├── components/       # Reusable components
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities and configs
│   └── context/          # React Context providers
├── assets/               # Images, fonts, icons
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

The `app/` directory is special — Expo Router uses it for **file-based routing**, meaning each file becomes a screen in your app.

---

## Core Components

React Native provides a set of built-in components that map to native UI elements. Here are the essential ones you will use in almost every app.

### View

`View` is the most fundamental component — the equivalent of `div` in web development. It is a container that supports layout with Flexbox, styling, and touch handling.

```jsx
import { View } from "react-native";

<View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
  {/* Child components go here */}
</View>
```

Key points:
- Views use **Flexbox** for layout (column direction by default, unlike web which defaults to row)
- Views don't render text directly — use `Text` for that
- Views can be nested to create complex layouts

### Text

`Text` is the only way to display text in React Native. Unlike the web where any element can contain text, React Native requires all text to be wrapped in a `Text` component.

```jsx
import { Text } from "react-native";

<Text style={{ fontSize: 24, fontWeight: "bold", color: "#000" }}>
  Hello World
</Text>
```

Key points:
- All text **must** be inside a `Text` component (putting a raw string inside a `View` will crash)
- `Text` supports nesting for inline styling:

```jsx
<Text>
  This is <Text style={{ fontWeight: "bold" }}>bold</Text> text
</Text>
```

### Image

`Image` displays images from local assets, remote URLs, or base64 data.

```jsx
import { Image } from "react-native";

// Remote image
<Image
  source={{ uri: "https://example.com/photo.jpg" }}
  style={{ width: 200, height: 200, borderRadius: 12 }}
/>

// Local image
<Image
  source={require("../assets/logo.png")}
  style={{ width: 100, height: 100 }}
/>
```

Key points:
- Remote images **require explicit dimensions** (width and height)
- For better performance, consider using `expo-image` instead (covered later)

### TextInput

`TextInput` is the equivalent of `<input>` on the web. It lets users type text.

```jsx
import { TextInput } from "react-native";

const [email, setEmail] = useState("");

<TextInput
  placeholder="Email..."
  placeholderTextColor="#999"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  autoComplete="email"
  style={{
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  }}
/>
```

Common props:
- `secureTextEntry` — hides text for passwords
- `keyboardType` — `"email-address"`, `"numeric"`, `"phone-pad"`, etc.
- `autoCapitalize` — `"none"`, `"sentences"`, `"words"`, `"characters"`
- `multiline` — allows multiple lines of input
- `maxLength` — limits character count
- `onChangeText` — called with the new text value (not an event object like web)

### TouchableOpacity

`TouchableOpacity` is a button wrapper that reduces opacity when pressed, giving visual feedback.

```jsx
import { TouchableOpacity, Text } from "react-native";

<TouchableOpacity
  style={{
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  }}
  onPress={() => console.log("Button pressed!")}
  disabled={isLoading}
>
  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
    Sign Up
  </Text>
</TouchableOpacity>
```

Key points:
- Use `onPress` instead of `onClick`
- `disabled` prevents the press handler from firing
- The opacity animation is built-in (no CSS transitions needed)

### FlatList

`FlatList` is a performant scrollable list that **only renders items currently visible on screen**. Essential for lists of any significant size.

```jsx
import { FlatList, Text, View } from "react-native";

const data = [
  { id: "1", title: "First Item" },
  { id: "2", title: "Second Item" },
];

<FlatList
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={{ padding: 16 }}>
      <Text>{item.title}</Text>
    </View>
  )}
  ListEmptyComponent={<Text>No items found</Text>}
/>
```

Key points:
- Always provide `keyExtractor` for performance
- `renderItem` receives `{ item, index }`
- `ListEmptyComponent` shows when data is empty
- Supports `ListHeaderComponent` and `ListFooterComponent`
- Much more performant than mapping inside a `ScrollView` for large lists

### ScrollView

`ScrollView` renders all its children at once and makes the content scrollable. Best for small, bounded content.

```jsx
import { ScrollView, Text } from "react-native";

<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
  <Text>This content scrolls!</Text>
  {/* More content... */}
</ScrollView>
```

Key points:
- **Do not use ScrollView for long lists** — use `FlatList` instead (ScrollView renders everything at once)
- `style` applies to the scroll container, `contentContainerStyle` applies to the inner content

### Modal

`Modal` presents content on top of everything else, like a dialog or full-screen overlay.

```jsx
import { Modal, View, Text, TouchableOpacity } from "react-native";

const [visible, setVisible] = useState(false);

<Modal visible={visible} transparent animationType="fade">
  <View style={{
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  }}>
    <View style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 24,
    }}>
      <Text>Modal Content</Text>
      <TouchableOpacity onPress={() => setVisible(false)}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
```

Key points:
- `transparent` makes the background see-through (you handle the backdrop yourself)
- `animationType` can be `"none"`, `"slide"`, or `"fade"`

### ActivityIndicator

A loading spinner.

```jsx
import { ActivityIndicator } from "react-native";

<ActivityIndicator size="large" color="#000" />

// Commonly used in buttons:
{isLoading ? (
  <ActivityIndicator size={24} color="#fff" />
) : (
  <Text>Submit</Text>
)}
```

### Alert

`Alert` shows a native platform dialog. It is **not a component** — it is an API you call.

```jsx
import { Alert } from "react-native";

// Simple alert
Alert.alert("Error", "Please fill in all fields");

// Alert with options
Alert.alert(
  "Choose an Option",   // Title
  "What would you like to do?",  // Message
  [
    { text: "Camera", onPress: () => openCamera() },
    { text: "Photo Library", onPress: () => openLibrary() },
    { text: "Cancel", style: "cancel" },
  ]
);
```

### SafeAreaView

Ensures content renders within the safe area boundaries of a device (avoiding notches, status bars, and home indicators).

```jsx
import { SafeAreaView } from "react-native-safe-area-context";

<SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
  {/* Content won't overlap with notch or home bar */}
</SafeAreaView>
```

Key points:
- Always use `react-native-safe-area-context` (the better third-party version)
- The `edges` prop lets you control which edges to pad: `"top"`, `"bottom"`, `"left"`, `"right"`

### RefreshControl

Adds pull-to-refresh functionality to `FlatList` or `ScrollView`.

```jsx
import { FlatList, RefreshControl } from "react-native";

const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await fetchData();
  setRefreshing(false);
};

<FlatList
  data={data}
  renderItem={renderItem}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
/>
```

---

## Styling in React Native

React Native uses JavaScript objects for styling, not CSS. The `StyleSheet.create` API is the standard approach.

```jsx
import { StyleSheet, View, Text } from "react-native";

export default function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
      <Text style={[styles.title, styles.subtitle]}>World</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
```

### Key Differences from CSS

| CSS | React Native |
|-----|-------------|
| `background-color` | `backgroundColor` (camelCase) |
| `font-size: 16px` | `fontSize: 16` (no units, always points) |
| `display: flex` | Flexbox is the **default** and only layout system |
| `flex-direction: row` | Default is `column` (not row) |
| Cascading / inheritance | No cascading — styles don't inherit (except within `Text`) |
| Classes | Array of style objects: `style={[styles.a, styles.b]}` |
| `border: 1px solid #ccc` | `borderWidth: 1, borderColor: "#ccc"` (separate properties) |

### Flexbox Basics

```jsx
// Horizontal row with items spaced evenly
<View style={{
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>

// Take up all available space
<View style={{ flex: 1 }}>
  <Text>This view fills the remaining space</Text>
</View>
```

### Shadows

Shadows work differently on iOS and Android:

```jsx
{
  // iOS shadows
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,

  // Android shadow
  elevation: 3,
}
```

---

## React Hooks Review

If you know React, these are the same hooks. Here is a quick refresher in the context of React Native.

### useState

Manages local component state.

```jsx
import { useState } from "react";

const [email, setEmail] = useState("");         // String
const [isLoading, setIsLoading] = useState(false); // Boolean
const [posts, setPosts] = useState<Post[]>([]);    // Typed array
```

### useEffect

Runs side effects (API calls, subscriptions, etc.).

```jsx
import { useEffect } from "react";

// Run once on mount
useEffect(() => {
  loadPosts();
}, []);

// Run when a dependency changes
useEffect(() => {
  if (user) {
    fetchProfile(user.id);
  }
}, [user]);
```

### useContext

Consumes a React Context to share state across the component tree without prop drilling.

```jsx
import { useContext, createContext } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for easier consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

---

## Navigation with Expo Router

Expo Router brings **file-based routing** to React Native — the same concept as Next.js. Files in your `app/` directory automatically become routes.

### File-Based Routing

```
app/
├── index.tsx          →  "/"
├── about.tsx          →  "/about"
├── settings/
│   ├── index.tsx      →  "/settings"
│   └── account.tsx    →  "/settings/account"
```

Every file that exports a default React component becomes a navigable screen.

### Layout Routes

`_layout.tsx` files define shared UI that wraps sibling routes (like navigation bars, headers, etc.).

```jsx
// app/_layout.tsx — Root layout
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
```

### Route Groups

Folders wrapped in parentheses `()` create **route groups** — they organize files without affecting the URL path.

```
app/
├── (auth)/              # Group: authentication screens
│   ├── _layout.tsx      # Stack navigator for auth screens
│   ├── login.tsx        # → "/(auth)/login"
│   ├── signup.tsx       # → "/(auth)/signup"
│   └── onboarding.tsx   # → "/(auth)/onboarding"
├── (tabs)/              # Group: main app screens
│   ├── _layout.tsx      # Tab navigator
│   ├── index.tsx        # → "/(tabs)/" (Home tab)
│   └── profile.tsx      # → "/(tabs)/profile" (Profile tab)
```

### Tab Navigation

Tab navigation is defined in a layout file using `NativeTabs` (or `Tabs` from expo-router):

```jsx
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"house"} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={"person"} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

### Programmatic Navigation

```jsx
import { useRouter } from "expo-router";

const router = useRouter();

// Navigate forward (adds to stack)
router.push("/(auth)/onboarding");

// Replace current screen (no back button)
router.replace("/(tabs)");

// Go back
router.back();
```

- `push` — adds a new screen to the stack (user can go back)
- `replace` — replaces the current screen (user cannot go back)

---

## Working with Images

### expo-image

`expo-image` is the recommended image component for Expo apps. It is faster and more feature-rich than the built-in `Image`.

```bash
npx expo install expo-image
```

```jsx
import { Image } from "expo-image";

<Image
  source={{ uri: "https://example.com/photo.jpg" }}
  style={{ width: 200, height: 200, borderRadius: 12 }}
  contentFit="cover"      // "cover", "contain", "fill", "none"
  cachePolicy="memory"    // Caching strategy
/>
```

### expo-image-picker

Lets users pick images from their photo library or take a photo with the camera.

```bash
npx expo install expo-image-picker
```

```jsx
import * as ImagePicker from "expo-image-picker";

// Pick from library
const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission needed", "We need photo library access.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],    // Square crop
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    setImage(result.assets[0].uri);
  }
};

// Take a photo
const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission needed", "We need camera access.");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    setImage(result.assets[0].uri);
  }
};
```

---

## State Management with Context API

For small-to-medium apps, React's built-in Context API is perfectly sufficient for global state. No need for Redux or Zustand.

The pattern is:

1. **Create a context** with types
2. **Create a provider** component that holds state
3. **Create a custom hook** for easy consumption

```jsx
// 1. Define types
interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

// 2. Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = async (email: string, password: string) => {
    // ... authentication logic
  };

  const signOut = async () => {
    // ... sign out logic
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

Usage in any component:

```jsx
const { user, signIn, signOut } = useAuth();
```

---

## Environment Variables in Expo

Expo supports environment variables through `.env` files. Variables prefixed with `EXPO_PUBLIC_` are available in your app code.

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```jsx
// Access in code
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

Important:
- Only `EXPO_PUBLIC_*` variables are bundled into your app
- Variables without the prefix are only available at build time / in scripts
- **Never commit `.env` files with secrets to git** — add `.env` to `.gitignore`

---

## TypeScript in React Native

TypeScript is strongly recommended for React Native projects. Expo supports it out of the box.

### Typing Component Props

```tsx
interface PostCardProps {
  post: Post;
  currentUserId?: string;  // Optional prop
}

const PostCard = ({ post, currentUserId }: PostCardProps) => {
  return (
    <View>
      <Text>{post.title}</Text>
    </View>
  );
};
```

### Typing State

```tsx
const [user, setUser] = useState<User | null>(null);
const [posts, setPosts] = useState<Post[]>([]);
const [image, setImage] = useState<string | null>(null);
```

### Typing Async Functions

```tsx
const fetchProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
};
```

---

# Part 2: The BeReal Clone Project

## Project Overview

This project is a **BeReal clone** — a social media app where users share one photo per day that automatically expires after 24 hours. The core concept encourages authentic, in-the-moment sharing.

### Features

- Email/password authentication with session persistence
- User onboarding (name, username, profile image)
- Photo posts from camera or photo library
- 24-hour post expiration with countdown timers
- One active post per user at a time (new post replaces old)
- Pull-to-refresh feed
- Profile management (edit image, view details)
- Database seeding script for development

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.83 + Expo SDK 55 |
| Language | TypeScript 5.9 |
| Navigation | Expo Router (file-based) |
| Backend | Supabase (Auth + PostgreSQL + Storage) |
| State | React Context API |
| Images | expo-image + expo-image-picker |
| Session Storage | AsyncStorage |

## App Architecture

```
┌──────────────────────────────────────────┐
│                 Root Layout              │
│            (_layout.tsx)                 │
│          ┌─ RouteGuard ─┐               │
│          │               │               │
│    No User?        Has User?             │
│          │               │               │
│          ▼               ▼               │
│   ┌──────────┐   ┌─────────────┐        │
│   │  (auth)  │   │Onboarding   │        │
│   │  group   │   │ Complete?   │        │
│   │          │   │             │        │
│   │ login    │   │  No → onboarding     │
│   │ signup   │   │  Yes → (tabs)        │
│   │ onboard  │   │             │        │
│   └──────────┘   └─────────────┘        │
│                         │                │
│                         ▼                │
│                  ┌──────────┐            │
│                  │  (tabs)  │            │
│                  │          │            │
│                  │  Home    │            │
│                  │  Profile │            │
│                  └──────────┘            │
└──────────────────────────────────────────┘
```

## Database Schema

### `profiles` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | References `auth.users.id` |
| `name` | text | Display name |
| `username` | text (unique) | Unique username |
| `profile_image_url` | text | URL to profile image in storage |
| `onboarding_completed` | boolean | Whether user finished onboarding |

### `posts` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK) | References `profiles.id` |
| `image_url` | text | URL to post image in storage |
| `description` | text (nullable) | Optional post caption |
| `created_at` | timestamp | When the post was created |
| `expires_at` | timestamp | When the post expires (created_at + 24h) |
| `is_active` | boolean | Whether the post is currently active |

### Storage Buckets

- **`profiles`** — Profile images stored as `{userId}/profile.{ext}`
- **`posts`** — Post images stored as `{userId}/{timestamp}.{ext}`

## Authentication Flow

1. **App starts** → `AuthProvider` checks for an existing session via Supabase
2. **No session** → `RouteGuard` redirects to `/login`
3. **User signs up** → Account created in Supabase Auth, profile row created in `profiles` table
4. **Onboarding check** → If `onboarding_completed` is `false`, user is redirected to `/onboarding`
5. **Onboarding** → User sets their name, username, and profile image
6. **Authenticated** → User is redirected to the main `(tabs)` group
7. **Session persists** → AsyncStorage stores the session so users stay logged in

## Posts System

### Creating a Post

1. User taps the FAB (floating action button) on the home screen
2. Chooses camera or photo library
3. Crops image to 1:1 aspect ratio
4. Previews the image and optionally adds a description
5. On submit:
   - Any existing active posts are deactivated
   - Image is uploaded to Supabase Storage
   - Post row is inserted with a 24-hour expiration time
   - Feed refreshes to show the new post

### Feed Loading

- Queries all posts where `is_active = true` AND `expires_at > now()`
- Joins with `profiles` table to get user info (name, username, avatar)
- Ordered by `created_at` descending (newest first)
- Supports pull-to-refresh

### Expiration Display

- Each post shows a countdown badge: `"5h 30m left"`
- Posts that expire are no longer returned by the query

## File Storage

Images are uploaded to Supabase Storage using the `expo-file-system` API:

```tsx
const uploadProfileImage = async (userId: string, imageUri: string) => {
  const fileExtension = imageUri.split(".").pop() || "jpg";
  const fileName = `${userId}/profile.${fileExtension}`;
  const file = new File(imageUri);
  const bytes = await file.bytes();

  await supabase.storage
    .from("profiles")
    .upload(fileName, bytes, {
      contentType: `image/${fileExtension}`,
      upsert: true,
    });

  const { data } = supabase.storage
    .from("profiles")
    .getPublicUrl(fileName);

  return `${data.publicUrl}?t=${Date.now()}`;
};
```

The `?t=${Date.now()}` cache-busting parameter ensures updated images are displayed immediately.

## Route Protection

The `RouteGuard` component in the root layout handles all navigation logic:

```tsx
function RouteGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Not logged in → send to login
      router.replace("/(auth)/login");
    } else if (!user.onboardingCompleted) {
      // Logged in but hasn't onboarded → send to onboarding
      router.replace("/(auth)/onboarding");
    } else {
      // Fully authenticated → send to main app
      router.replace("/(tabs)");
    }
  }, [user, segments]);
}
```

This runs on every state change, so users can never access screens they shouldn't be on.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/machadop1407/react-native-app-course.git
cd react-native-app-course
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

Create a project at [supabase.com](https://supabase.com) and set up:

- **Authentication** — Enable email/password sign-ups
- **Database** — Create `profiles` and `posts` tables (see schema above)
- **Storage** — Create `profiles` and `posts` buckets with public access

### 4. Configure environment variables

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 5. Seed the database (optional)

```bash
npm run seed
```

This creates 10 fake users with profiles and posts for development.

### 6. Start the app

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `i` / `a` for simulators.

## Project File Structure

```
berealclone/
├── src/
│   ├── app/
│   │   ├── _layout.tsx               # Root layout + RouteGuard
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx           # Auth stack navigator
│   │   │   ├── login.tsx             # Login screen
│   │   │   ├── signup.tsx            # Sign up screen
│   │   │   └── onboarding.tsx        # Profile setup (name, username, image)
│   │   └── (tabs)/
│   │       ├── _layout.tsx           # Tab navigator (Home + Profile)
│   │       ├── index.tsx             # Home feed with posts
│   │       └── profile.tsx           # User profile screen
│   ├── context/
│   │   └── AuthContext.tsx           # Auth state (user, signIn, signUp, signOut)
│   ├── hooks/
│   │   └── usePosts.ts              # Post CRUD operations
│   ├── lib/
│   │   ├── date-helper.ts           # Time formatting (ago, remaining)
│   │   └── supabase/
│   │       ├── client.ts            # Supabase client initialization
│   │       └── storage.ts           # Image upload utilities
│   └── scripts/
│       └── seed.ts                  # Database seeding script
├── assets/                          # App icons, splash screen, images
├── .env                             # Environment variables (not committed)
├── app.json                         # Expo configuration
├── package.json                     # Dependencies and scripts
└── tsconfig.json                    # TypeScript configuration
```
