import { CreateAccountPayload, CreateAccountResponse, CreateTouristAccountPayload, CreateTouristAccountResponse, LoginPayload, LoginResponse, LogoutPayload, LogoutResponse, PassportStatusResponse, ProfileResponse, RefreshPayload, RefreshResponse, SendOtpPayload, SendOtpResponse, SendTouristOtpPayload, SendTouristOtpResponse, UploadPassportResponse, ValidateOtpPayload, ValidateOtpResponse, ValidateTouristOtpPayload, ValidateTouristOtpResponse, VerifyBvnPayload, VerifyBvnResponse, VerifyKycPayload, VerifyKycResponse, VerifyPassportPayload, VerifyPassportResponse } from '@/types/api/auth';
import api from './api';

export const loginUser = async (credentials: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const verifyBvn = async (payload: VerifyBvnPayload): Promise<VerifyBvnResponse> => {
    const response = await api.post('/auth/signup/nigerian/verify-bvn', payload);
    return response.data;
};

export const sendOtp = async (payload: SendOtpPayload): Promise<SendOtpResponse> => {
    const response = await api.post('/auth/signup/nigerian/send-otp', payload);
    return response.data;
};

export const validateOtp = async (payload: ValidateOtpPayload): Promise<ValidateOtpResponse> => {
    const response = await api.post('/auth/signup/nigerian/validate-otp', payload);
    return response.data;
};

export const createAccount = async (payload: CreateAccountPayload): Promise<CreateAccountResponse> => {
    const response = await api.post('/auth/signup/nigerian/create-account', payload);
    return response.data;
};

export const verifyPassport = async (payload: VerifyPassportPayload): Promise<VerifyPassportResponse> => {
    const response = await api.post('/auth/signup/tourist/verify-passport', payload);
    return response.data;
};

export const sendTouristOtp = async (payload: SendTouristOtpPayload): Promise<SendTouristOtpResponse> => {
    const response = await api.post('/auth/signup/tourist/send-otp', payload);
    return response.data;
};

export const validateTouristOtp = async (payload: ValidateTouristOtpPayload): Promise<ValidateTouristOtpResponse> => {
    const response = await api.post('/auth/signup/tourist/validate-otp', payload);
    return response.data;
};

export const createTouristAccount = async (payload: CreateTouristAccountPayload): Promise<CreateTouristAccountResponse> => {
    const response = await api.post('/auth/signup/tourist/create-account', payload);
    return response.data;
};

export const refreshTokens = async (payload: RefreshPayload): Promise<RefreshResponse> => {
    const response = await api.post('/auth/refresh', payload);
    return response.data;
};

export const logoutUser = async (payload: LogoutPayload): Promise<LogoutResponse> => {
    const response = await api.post('/auth/logout', payload);
    return response.data;
};

export const verifyKyc = async (payload: VerifyKycPayload): Promise<VerifyKycResponse> => {
    const response = await api.post('/auth/kyc/verify', payload);
    return response.data;
};

export const uploadPassport = async (formData: FormData): Promise<UploadPassportResponse> => {
    const response = await api.post('/auth/signup/tourist/upload-passport', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getPassportStatus = async (): Promise<PassportStatusResponse> => {
    const response = await api.get('/auth/kyc/passport/status');
    return response.data;
};

export const getUserProfile = async (): Promise<ProfileResponse> => {
    const response = await api.get('/auth/profile');
    return response.data;
};
