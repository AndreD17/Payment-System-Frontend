import { Navigate } from "react-router-dom";
import { getAccessToken } from "../api";

export default function ProtectedRoute({ children }: { children: React.ReactNode}) {
  const token = getAccessToken();
  if (!token) return <Navigate to="/" replace />;
  return children;
}