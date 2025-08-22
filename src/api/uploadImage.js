export const uploadImage = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dwe66cwnj/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "taskManagement";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "task-management-app");

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error("No URL returned from image upload");
    }
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error(error.message || "Failed to upload image");
  }
};

export default uploadImage;