import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../models/context/AuthContext';
import authService from '../models/services/authService';
import { ROUTES } from '../config/routes';

const useAuthController = () => {
  const { login: setAuth, logout: clearAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loginWithEmail = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authService.login({ email, password });
      setAuth(data.user, data.token);
      navigate(ROUTES.STUDENT_DASHBOARD);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [setAuth, navigate]);

  const sendOTP = useCallback(async (phone) => {
    setLoading(true);
    setError(null);
    try {
      await authService.sendOTP(phone);
      navigate(ROUTES.OTP_VERIFICATION);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const verifyOTP = useCallback(async (phone, otp) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authService.verifyOTP(phone, otp);
      setAuth(data.user, data.token);
      navigate(ROUTES.STUDENT_DASHBOARD);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }, [setAuth, navigate]);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authService.register(userData);
      setAuth(data.user, data.token);
      navigate(ROUTES.PROFILE_SETUP);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [setAuth, navigate]);

  const logout = useCallback(() => {
    clearAuth();
    navigate(ROUTES.HOME);
  }, [clearAuth, navigate]);

  return { loginWithEmail, sendOTP, verifyOTP, register, logout, loading, error };
};

export default useAuthController;
