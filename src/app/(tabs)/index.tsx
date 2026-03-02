import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { Post, usePosts } from "@/hooks/usePosts";
import { formatTimeAgo, formatTimeRemaining } from "@/lib/date-helper";
import { supabase } from "@/lib/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  refreshPosts: () => Promise<void>;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    name: string;
    profile_image_url: string;
  };
}

const PostCard = ({ post, currentUserId, refreshPosts }: PostCardProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const postUser = post.profiles;
  const isOwnPost = post.user_id === currentUserId;

  useEffect(() => {
    loadComments();
  }, [post.id]);

  const toggleLike = async () => {
    if (!currentUserId) return;

    try {
      const { data: existingLike } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);

      if (existingLike && existingLike.length > 0) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);
      } else {
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        });
      }
      await refreshPosts();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const hidePost = async () => {
    if (!currentUserId) return;
    try {
      const { error } = await supabase.from("hidden_posts").insert({
        post_id: post.id,
        user_id: currentUserId,
      });

      if (error) {
        console.log("Hide error:", error);
        return;
      }
      setMenuVisible(false);
      await refreshPosts();
    } catch (error) {
      console.error("Error hiding post:", error);
    }
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`*, profiles(name, username, profile_image_url)`)
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (!error) setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const addComment = async () => {
    if (!currentUserId || !newComment.trim()) return;
    try {
      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        user_id: currentUserId,
        content: newComment.trim(),
      });

      if (error) {
        console.log("Comment error:", error);
        return;
      }

      setNewComment("");
      await loadComments();
      await refreshPosts();
      setCommentModalVisible(false);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const openComments = async () => {
    await loadComments();
    setCommentModalVisible(true);
  };

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          {postUser?.profile_image_url ? (
            <Image
              // cachePolicy="memory-disc"
              source={{ uri: postUser.profile_image_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {postUser?.name?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.username}>
              {isOwnPost ? "You" : `@${postUser?.username}`}
            </Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.timeRemainingBadge}>
            <Text style={styles.timeRemainingText}>
              {formatTimeRemaining(post.expires_at)}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={18}
              color="black"
            />
          </TouchableOpacity>

          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <TouchableOpacity
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
            >
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.menuItem} onPress={hidePost}>
                  <Text style={styles.menuText}>Not Interested</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </View>

      <Image
        // cachePolicy="memory-disc"
        source={{ uri: post.image_url }}
        style={styles.postImage}
        contentFit="cover"
      />

      <View style={styles.postFooter}>
        {post.description && (
          <Text style={styles.postDescription}>{post.description}</Text>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.postInfo}>
            {isOwnPost ? "Your Post" : `${postUser?.name}'s post`} • Expires in{" "}
            {formatTimeRemaining(post.expires_at)}
          </Text>

          <View style={styles.iconRow}>
            {/* ❤️ Like */}
            <TouchableOpacity style={styles.iconItem} onPress={toggleLike}>
              <MaterialCommunityIcons
                name={post.isLiked ? "heart" : "heart-outline"}
                size={24}
                color={post.isLiked ? "red" : "black"}
              />
              <Text style={styles.iconText}>{post.likeCount ?? 0}</Text>
            </TouchableOpacity>

            {/* 💬 Comment */}
            <TouchableOpacity style={styles.iconItem} onPress={openComments}>
              <MaterialCommunityIcons
                name="comment-outline"
                size={24}
                color="black"
              />
              <Text style={styles.iconText}>{post.commentCount ?? 0}</Text>
            </TouchableOpacity>

            {/* 🔄 Share */}
            <TouchableOpacity
              style={styles.iconItem}
              onPress={() => console.log("Share")}
            >
              <MaterialCommunityIcons
                name="share-outline"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>
        </View>

        {comments.length > 0 && (
          <TouchableOpacity
            style={styles.commentPreviewSection}
            onPress={openComments}
            activeOpacity={0.7}
          >
            {comments.slice(-2).map((c) => (
              <View key={c.id} style={styles.commentPreviewRow}>
                <Text style={styles.commentPreviewUsername}>
                  @{c.profiles?.username || "User"}
                </Text>
                <Text style={styles.commentPreviewText} numberOfLines={1}>
                  {" "}
                  {c.content}
                </Text>
              </View>
            ))}
            {post.commentCount !== undefined && post.commentCount > 2 && (
              <Text style={styles.viewAllComments}>
                View all {post.commentCount} comments
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.commentModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setCommentModalVisible(false)}
          />

          <View style={styles.commentModalContent}>
            <View style={styles.commentModalHeader}>
              <Text style={styles.commentModalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              style={styles.commentsList}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentUsername}>
                    @{item.profiles?.username || "User"}
                  </Text>
                  <Text style={styles.commentText}>{item.content}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyComments}>No comments yet.</Text>
              }
            />

            <View style={styles.commentInputRow}>
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                style={styles.commentInput}
                multiline
              />
              <TouchableOpacity
                onPress={addComment}
                disabled={!newComment.trim() || isLoadingComments}
                style={styles.commentSendButton}
              >
                {isLoadingComments ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.commentSendText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function Index() {
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState<{ title: string; message: string } | null>(
    null,
  );
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const flatListRef = useRef<FlatList<Post>>(null);

  const { createPost, posts, refreshPosts } = usePosts();
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      refreshPosts();
    }, [refreshPosts]),
  );

  const userActivePost = posts.find(
    (post) =>
      post.user_id === user?.id &&
      post.is_active &&
      new Date(post.expires_at) > new Date(),
  );
  const hasActivePost = !!userActivePost;

  const showModal = (title: string, message: string) =>
    setModal({ title, message });

  const hideModal = () => setModal(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPosts();
    } catch (error) {
      console.error("Error refreshing posts:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleImagePickerClose = () => {
    setShowImagePickerModal(false);
  };

  const pickImage = async () => {
    handleImagePickerClose();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showModal(
        "Permission needed",
        "We need camera roll permissions to select a profile image.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPreviewImage(result.assets[0].uri);
      setShowPreview(true);
      setDescription("");
    }
  };

  const takePhoto = async () => {
    handleImagePickerClose();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showModal(
        "Permission needed",
        "We need camera permissions to take a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPreviewImage(result.assets[0].uri);
      setShowPreview(true);
      setDescription("");
    }
  };

  const handlePost = async () => {
    if (!previewImage) return;
    setIsUploading(true);
    try {
      await createPost(previewImage, description);
      setPreviewImage(null);
      setDescription("");
      setShowPreview(false);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error("Error creating post:", error);
      showModal("Error", "Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        currentUserId={user?.id}
        refreshPosts={refreshPosts}
      />
    ),
    [user?.id, refreshPosts],
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
      {/* LIST */}
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyContent : styles.content
        }
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No posts found</Text>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ width: "100%" }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowImagePickerModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Preview Modal */}
      <Modal visible={showPreview} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Preview Your Post</Text>
            {previewImage && (
              <Image
                // cachePolicy="memory-disc"
                source={{ uri: previewImage }}
                style={styles.previewImage}
                contentFit="cover"
              />
            )}
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a description (optional)"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPreview(false);
                  setPreviewImage(null);
                  setDescription("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.postButton]}
                onPress={handlePost}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size={24} color="#fff" />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image picker choice modal */}
      <ConfirmModal
        visible={showImagePickerModal}
        title="Select Image"
        message="Choose how you'd like to add a photo."
        confirmText="Camera"
        cancelText="Photo Library"
        onCancel={pickImage}
        onConfirm={takePhoto}
      />

      {/* Info / error modal */}
      <ConfirmModal
        visible={!!modal}
        title={modal?.title ?? ""}
        message={modal?.message ?? ""}
        infoOnly
        onCancel={hideModal}
        onConfirm={hideModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  fab: {
    position: "absolute",
    bottom: 104,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  fabText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  descriptionInput: {
    width: "100%",
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#000",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  postButton: {
    backgroundColor: "#000",
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  postContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  timeAgo: {
    fontSize: 12,
    color: "#666",
  },
  timeRemainingBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeRemainingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
  },
  postFooter: {
    padding: 16,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  postDescription: {
    fontSize: 15,
    color: "#000",
    marginBottom: 8,
    lineHeight: 20,
  },
  postInfo: {
    fontSize: 14,
    color: "#666",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  iconItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconText: {
    fontSize: 14,
    color: "#000",
  },
  menuOverlay: {
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    width: 170,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 15,
    color: "#000",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  commentModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    padding: 20,
  },
  commentModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  commentModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentsList: {
    maxHeight: 300,
  },
  commentItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#333",
  },
  emptyComments: {
    textAlign: "center",
    color: "#999",
    marginVertical: 20,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  commentSendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentSendText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  commentPreviewSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 4,
  },
  commentPreviewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  commentPreviewUsername: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },
  commentPreviewText: {
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
  viewAllComments: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
});
