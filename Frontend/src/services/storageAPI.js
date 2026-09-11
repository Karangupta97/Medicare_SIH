import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL =
  rawApiUrl && rawApiUrl !== "undefined"
    ? rawApiUrl
    : "https://medicare-backend-vl01.onrender.com";

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

const storageAPI = {
  getStorageInfo: async () => {
    const response = await axios.get("/api/storage/storage-info");
    return response.data;
  },
};

export default storageAPI;
