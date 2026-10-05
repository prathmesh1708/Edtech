import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../models/context/AuthContext';
import authService from '../models/services/authService';
import { ROUTES } from '../config/routes';

const useAuthController = () => {
  const { login: setAuth, logout: clearAuth, user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // HTTP status of the last failed auth request (null for network / client-side errors).
  const [errorStatus, setErrorStatus] = useState(null);
  const navigate = useNavigate();

  // Prefer the server's message; axios's own err.message is a generic "Request failed with status code N".
  const failWith = useCallback((err, fallback) => {
    setErrorStatus(err.response?.status ?? null);
    setError(err.response?.data?.message || err.message || fallback);
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    setErrorStatus(null);
    try {
      const { data } = await authService.login({ email, password });
      const { token, ...user } = data;
      
      const currentPath = window.location.pathname;
      const isAdminFlow = currentPath === ROUTES.ADMIN_LOGIN || currentPath.startsWith('/login/admin') || currentPath === '/admin/login' || currentPath.startsWith('/admin/login');
      
      if (isAdminFlow && user.role !== 'admin') {
        throw new Error('Access Denied: Only administrators can log in here.');
      }

      setAuth(user, token);
      if (user.role === 'admin') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.STUDENT_DASHBOARD);
      }
    } catch (err) {
      failWith(err, 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [setAuth, navigate, failWith]);

  const sendOTP = useCallback(async (phone) => {
    setLoading(true);
    setError(null);
    setErrorStatus(null);
    try {
      await authService.sendOTP(phone);
      navigate(ROUTES.OTP_VERIFICATION);
    } catch (err) {
      failWith(err, 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }, [navigate, failWith]);

  const verifyOTP = useCallback(async (phone, otp) => {
    setLoading(true);
    setError(null);
    setErrorStatus(null);
    try {
      const { data } = await authService.verifyOTP(phone, otp);
      const { token, ...user } = data;

      const currentPath = window.location.pathname;
      const isAdminFlow = currentPath === ROUTES.ADMIN_LOGIN || currentPath.startsWith('/login/admin');
      
      if (isAdminFlow && user.role !== 'admin') {
        throw new Error('Access Denied: Only administrators can log in here.');
      }

      setAuth(user, token);
      if (user.role === 'admin') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.STUDENT_DASHBOARD);
      }
    } catch (err) {
      failWith(err, 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }, [setAuth, navigate, failWith]);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    setErrorStatus(null);
    try {
      const { data } = await authService.register(userData);
      const { token, ...user } = data;
      setAuth(user, token);
      navigate(ROUTES.OTP_VERIFICATION);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [setAuth, navigate]);

  const logout = useCallback(() => {
    const isAdmin = currentUser?.role === 'admin';
    clearAuth();
    if (isAdmin) {
      navigate(ROUTES.ADMIN_LOGIN);
    } else {
      navigate(ROUTES.HOME);
    }
  }, [clearAuth, navigate, currentUser]);

  return { loginWithEmail, sendOTP, verifyOTP, register, logout, loading, error, errorStatus };
};

export default useAuthController;
