import React from 'react';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';

export const toastConfig: ToastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: '#4f46e5',
                backgroundColor: '#ffffff',
                borderRadius: 16,
                height: 70,
                width: '90%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
                borderLeftWidth: 10,
            }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            text1Style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#1f2937'
            }}
            text2Style={{
                fontSize: 13,
                color: '#6b7280'
            }}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{
                borderLeftColor: '#ef4444',
                backgroundColor: '#fff',
                borderRadius: 16,
                height: 70,
                width: '90%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
                borderLeftWidth: 10,
            }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            text1Style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#1f2937'
            }}
            text2Style={{
                fontSize: 13,
                color: '#6b7280'
            }}
        />
    ),
    info: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: '#8b5cf6',
                backgroundColor: '#fff',
                borderRadius: 16,
                height: 70,
                width: '90%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
                borderLeftWidth: 10,
            }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            text1Style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#1f2937'
            }}
            text2Style={{
                fontSize: 13,
                color: '#6b7280'
            }}
        />
    )
};
