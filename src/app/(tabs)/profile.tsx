import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { uploadProfileImage } from "@/lib/supabase/storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Post } from "./../../hooks/usePosts";
const { width, height } = Dimensions.get("window");
const ITEM_SIZE = (width - 500) / 3;

export default function Profile() {
  const { user, updateUser, signOut, deleteAccount } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  // Generic info/error modal
  const [modal, setModal] = useState<{ title: string; message: string } | null>(
    null,
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const showModal = (title: string, message: string) =>
    setModal({ title, message });
  const hideModal = () => setModal(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);

  const handleUpdateProfileImage = async () => {
    if (!user) return;

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
      setIsUpdating(true);
      try {
        const imageUrl = await uploadProfileImage(
          user.id,
          result.assets[0].uri,
        );

        await updateUser({ profileImage: imageUrl });
        showModal("Success", "Profile image updated.");
      } catch (error) {
        console.error("Error updating profile image:", error);
        showModal("Error", "Failed to update profile image. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const fetchMyPosts = useCallback(async () => {
    if (!user?.id) {
      setPosts([]);
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
    } else {
      setPosts(data);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchMyPosts();
    }, [fetchMyPosts]),
  );

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      console.log("Delete error:", error.message);
    } else {
      setMenuVisibleId(null);
      fetchMyPosts();
    }
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setSelectedImage(item.image_url)}>
        <Image source={{ uri: item.image_url }} style={styles.image} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuIcon}
        onPress={() => setMenuVisibleId(item.id)}
      >
        <MaterialCommunityIcons name="dots-vertical" size={18} color="black" />
      </TouchableOpacity>
      {menuVisibleId === item.id && (
        <View style={styles.menuBox}>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.menuText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
          // onPress={() => handleRearrange(item.id)}
          >
            <Text style={styles.menuText}>Rearrange</Text>
          </TouchableOpacity>

          <TouchableOpacity
          // onPress={() => handleHide(item.id)}
          >
            <Text style={styles.menuText}>Hide</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuVisibleId(null)}>
            <Text style={{ color: "red" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={handleUpdateProfileImage}
            disabled={isUpdating}
          >
            <View>
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.profileImage}
                  cachePolicy={"none"}
                />
              ) : (
                <View
                  style={[styles.profileImage, styles.profileImagePlaceholder]}
                >
                  <Text style={styles.profileImageText}>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}

              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>Edit</Text>
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.name || "No Name"}</Text>
          <Text style={styles.username}>@{user?.username || "user"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.sectionPost}>
          <Text style={styles.sectionTitle}>Posts</Text>

          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            numColumns={7}
            renderItem={renderItem}
            columnWrapperStyle={{ justifyContent: "space-between" }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Edit Profile</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privacy</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Help & Support</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.settingItem, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sign out confirmation */}
      <ConfirmModal
        visible={showSignOutModal}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        onCancel={() => setShowSignOutModal(false)}
        onConfirm={async () => {
          setShowSignOutModal(false);
          await signOut();
          router.replace("/(auth)/login");
        }}
      />

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          setShowDeleteModal(false);
          try {
            await deleteAccount();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Error deleting account:", error);
            showModal("Error", "Failed to delete account. Please try again.");
          }
        }}
      />
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
    backgroundColor: "#fff",
  },
  content: {
    padding: 32,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: "600",
    color: "#666",
  },
  editBadge: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: [{ translateX: -22 }],
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  username: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 18,
    color: "#999",
  },
  settingValue: {
    fontSize: 18,
    color: "#999",
  },
  signOutButton: {
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
  },
  signOutText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff3b30",
  },
  deleteText: {
    fontSize: 16,
    color: "#ff3b30",
    fontWeight: "500",
  },
  card: {
    position: "relative",
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginBottom: 6,
    borderRadius: 8,
  },
  sectionPost: {
    marginBottom: 32,
  },
  menuIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 4,
  },
  menuBox: {
    position: "absolute",
    top: 40,
    right: 10,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    elevation: 5,
  },
  menuText: {
    fontSize: 14,
    marginBottom: 8,
  },
});
