const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryReady = !!CLOUD_NAME && !!UPLOAD_PRESET;

// shrink big phone photos before uploading (faster and saves space)
function shrinkImage(file, maxSize = 1600) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      if (scale === 1 && file.size < 1.5 * 1024 * 1024) return resolve(file);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      const type = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob((blob) => resolve(blob || file), type, 0.88);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

// uploads one image to Cloudinary and gives back its web address (URL)
export async function uploadImage(file, folder, onProgress) {
  if (!cloudinaryReady) {
    throw new Error("Cloudinary is not set up yet. Check your .env file.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const body = await shrinkImage(file);
  const form = new FormData();
  form.append("file", body, "upload");
  form.append("upload_preset", UPLOAD_PRESET);
  if (folder) form.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // ignore
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
        resolve(data.secure_url);
      } else {
        reject(new Error(data?.error?.message || "Upload failed. Please try again."));
      }
    };

    xhr.onerror = () => reject(new Error("No internet connection."));
    xhr.send(form);
  });
}

// makes a Cloudinary image small and fast: f_auto,q_auto,w_600
export function optimizeImage(url, width = 600) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  if (url.includes("/image/upload/f_auto")) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width}/`);
}