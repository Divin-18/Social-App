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
  profiles?: PostUser | null;
  likeCount?: number;
  isLiked?: boolean;
  commentCount?: number;
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
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
        *,
        profiles(id, name, username, profile_image_url),
        likes(user_id),
        hidden_posts!left(user_id)
      `,
        )
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data) {
        setPosts([]);
        return;
      }

      const visiblePosts = data.filter((post: any) => {
        const isHidden = post.hidden_posts?.some(
          (h: any) => h.user_id === user.id,
        );
        return !isHidden;
      });

      const formattedPosts: Post[] = visiblePosts.map((post: any) => ({
        ...post,
        profiles: post.profiles || null,
        likeCount: post.likes?.length ?? 0,
        isLiked: post.likes?.some((like: any) => like.user_id === user.id),
        commentCount: post.comments?.length ?? 0,
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error in loadPosts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const createPost = useCallback(
    async (imageUri: string, description?: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        await supabase
          .from("posts")
          .update({ is_active: false })
          .eq("user_id", user.id)
          .eq("is_active", true);

        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = `${user.id}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(fileName, blob, {
            contentType: "image/jpeg",
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("posts").getPublicUrl(fileName);

        const imageUrl = data.publicUrl;

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const { error } = await supabase.from("posts").insert({
          user_id: user.id,
          image_url: imageUrl,
          description: description || null,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });

        if (error) throw error;

        await loadPosts();
      } catch (error) {
        console.error("Error creating post:", error);
        throw error;
      }
    },
    [loadPosts, user],
  );

  const refreshPosts = useCallback(async () => {
    await loadPosts();
  }, [loadPosts]);

  return { createPost, posts, refreshPosts, isLoading };
};
