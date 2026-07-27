import axios from "axios";
import { ENV } from "@/config/env";

export const quranApiClient = axios.create({
  baseURL: ENV.QURAN_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
