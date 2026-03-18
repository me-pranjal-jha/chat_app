import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

// console.log("Cloudinary config loaded:", {
//   cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
//   api_key_present: !!ENV.CLOUDINARY_API_KEY,
//   api_secret_present: !!ENV.CLOUDINARY_API_SECRET,
// });

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

export default cloudinary;