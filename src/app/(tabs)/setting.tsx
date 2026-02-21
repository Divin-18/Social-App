import React, { useState } from "react";
import { Dimensions, StyleSheet, Text } from "react-native";

const { width, height } = Dimensions.get("window");
const ITEM_SIZE = width / 3 - 6;

const posts = [
  { id: "1", image: "https://picsum.photos/600/600?1" },
  { id: "2", image: "https://picsum.photos/600/600?2" },
  { id: "3", image: "https://picsum.photos/600/600?3" },
  { id: "4", image: "https://picsum.photos/600/600?4" },
  { id: "5", image: "https://picsum.photos/600/600?5" },
  { id: "6", image: "https://picsum.photos/600/600?6" },
];

export default function Setting() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    // <View style={styles.container}>
    //   <Text style={styles.title}>My Posts</Text>

    //   <FlatList
    //     data={posts}
    //     keyExtractor={(item) => item.id}
    //     numColumns={3}
    //     renderItem={({ item }) => (
    //       <TouchableOpacity onPress={() => setSelectedImage(item.image)}>
    //         <Image source={{ uri: item.image }} style={styles.image} />
    //       </TouchableOpacity>
    //     )}
    //     columnWrapperStyle={{ justifyContent: "space-between" }}
    //   />

    //   {/* Full Image Modal */}
    //   <Modal visible={!!selectedImage} transparent animationType="fade">
    //     <View style={styles.modalContainer}>
    //       <Pressable
    //         style={styles.closeArea}
    //         onPress={() => setSelectedImage(null)}
    //       />

    //       {selectedImage && (
    //         <Image
    //           source={{ uri: selectedImage }}
    //           style={styles.fullImage}
    //           resizeMode="contain"
    //         />
    //       )}
    //     </View>
    //   </Modal>
    // </View>
    <Text>Setting</Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginBottom: 6,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: width,
    height: height * 0.8,
  },
  closeArea: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
