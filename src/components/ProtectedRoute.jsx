import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import PropTypes from "prop-types";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) return null; // ← no mostramos nada mientras se hidrata

  if (!user) return <Navigate to="/" replace />;

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};
