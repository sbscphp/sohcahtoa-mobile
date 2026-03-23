import { useMutation } from '@tanstack/react-query';
import { registerDevice } from '../../../services/notifications';
import { RegisterDevicePayload, RegisterDeviceResponse } from '../../../types/api/notifications';

export const useRegisterDeviceMutation = () => {
    return useMutation<RegisterDeviceResponse, Error, RegisterDevicePayload>({
        mutationFn: registerDevice,
    });
};
