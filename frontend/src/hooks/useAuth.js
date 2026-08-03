import { useDispatch, useSelector } from 'react-redux';
import {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsInitializing,
  selectAuthError,
  loginUser,
  registerUser,
  logoutUser,
  fetchMe,
  sendForgotPassword,
  resetUserPassword,
  changeUserPassword,
  updateUserProfile,
  clearError,
} from '../features/auth/authSlice';
import { initiateGoogleLogin } from '../api/authAPI';

const useAuth = () => {
  const dispatch = useDispatch();

  return {
    // State
    user: useSelector(selectUser),
    isAuthenticated: useSelector(selectIsAuthenticated),
    isLoading: useSelector(selectIsLoading),
    isInitializing: useSelector(selectIsInitializing),
    error: useSelector(selectAuthError),

    // Actions
    login: (data) => dispatch(loginUser(data)),
    register: (data) => dispatch(registerUser(data)),
    logout: () => dispatch(logoutUser()),
    fetchMe: () => dispatch(fetchMe()),
    forgotPassword: (email) => dispatch(sendForgotPassword(email)),
    resetPassword: (data) => dispatch(resetUserPassword(data)),
    changePassword: (data) => dispatch(changeUserPassword(data)),
    updateProfile: (data) => dispatch(updateUserProfile(data)),
    googleLogin: initiateGoogleLogin,
    clearError: () => dispatch(clearError()),
  };
};

export default useAuth;
