import { render } from '@testing-library/react-native';
import React from 'react';
import CredentialStep from '../components/transaction-flow/CredentialStep';

describe('CredentialStep', () => {
    const defaultProps = {
        fields: [
            { label: 'Full Name', type: 'text' as const, required: true },
            { label: 'Country', type: 'select' as const },
        ],
    };

    it('renders the default title', () => {
        const { getByText } = render(<CredentialStep {...defaultProps} />);
        expect(getByText('Enter all required credentials to proceed')).toBeTruthy();
    });

    it('renders InputField and SelectField mocks', () => {
        const { getByText } = render(<CredentialStep {...defaultProps} />);
        // New mock renders the label in a Text node and the value in a TextInput
        expect(getByText('Full Name')).toBeTruthy();
        expect(getByText('SelectField Country')).toBeTruthy();
    });

    it('renders custom components if provided', () => {
        const { Text } = require('react-native');
        const props = {
            fields: [
                { customComponent: <Text>Custom Field</Text> }
            ]
        };
        const { getByText } = render(<CredentialStep {...props} />);
        expect(getByText('Custom Field')).toBeTruthy();
    });
});
