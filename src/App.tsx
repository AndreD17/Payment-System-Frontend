import { Navigate, Route, Routes } from "react-router-dom";
import Pricing from "./pages/Pricing";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import AdminRefund from "./pages/AdminRefund";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Pricing />} />
      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />
      <Route path="/admin/refund" element={<AdminRefund />} />
      <Route path="/billing/success" element={<Success />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
