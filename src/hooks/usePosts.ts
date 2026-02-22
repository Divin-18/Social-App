import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";

export interface PostUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  description?: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  profiles?: PostUser;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadPosts = useCallback(async () => {
    if (!user) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `
            *,
            profiles(id, name, username, profile_image_url)`,
        )
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error loading posts:", postsError);
        throw postsError;
      }

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      const postsWithProfiles = postsData.map((post) => ({
        ...post,
        profiles: post.profiles || null,
      }));

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error("Error in loadPosts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const createPost = useCallback(async (imageUri: string, description?: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // 1️⃣ Deactivate any existing active posts
      const { error: deactivateError } = await supabase
        .from("posts")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (deactivateError) {
        console.error("Error deactivating old posts:", deactivateError);
      }

      // 2️⃣ Upload image to Supabase Storage
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const fileName = `${user.id}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("posts") // bucket name
        .upload(fileName, blob, {
          contentType: "image/jpeg",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // 3️⃣ Get public URL
      const { data } = supabase.storage.from("posts").getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      // 4️⃣ Calculate expiration time (24 hours)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // 5️⃣ Insert post into database
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        image_url: imageUrl,
        description: description || null,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });

      if (error) {
        console.error("Error creating post:", error);
        throw error;
      }

      // 6️⃣ Refresh posts
      await loadPosts();
    } catch (error) {
      console.error("Error in createPost:", error);
      throw error;
    }
  }, [loadPosts, user]);

  const refreshPosts = useCallback(async () => {
    await loadPosts();
  }, [loadPosts]);

  return { createPost, posts, refreshPosts, isLoading };
};
