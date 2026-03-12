import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SelectField from '../components/SelectField';

// Unmock the component so we can test the real implementation
jest.unmock('../components/SelectField');

describe('SelectField', () => {
    const defaultProps = {
        label: 'Country',
        placeholder: 'Select Country',
        onPress: jest.fn(),
    };

    it('renders the label and placeholder correctly', () => {
        const { getByText } = render(<SelectField {...defaultProps} />);
        expect(getByText('Country')).toBeTruthy();
        expect(getByText('Select Country')).toBeTruthy();
    });

    it('renders the value when provided', () => {
        const { getByText, queryByText } = render(<SelectField {...defaultProps} value="Nigeria" />);
        expect(getByText('Nigeria')).toBeTruthy();
        expect(queryByText('Select Country')).toBeNull();
    });

    it('calls onPress when the field is pressed', () => {
        const { getByTestId } = render(<SelectField {...defaultProps} />);
        fireEvent.press(getByTestId('select-field-touchable'));
        expect(defaultProps.onPress).toHaveBeenCalled();
    });

    it('displays error message when error prop is provided', () => {
        const { getByText } = render(<SelectField {...defaultProps} error="Required field" />);
        expect(getByText('Required field')).toBeTruthy();
    });

    it('is disabled when disabled prop is true', () => {
        const { getByTestId } = render(<SelectField {...defaultProps} disabled={true} />);
        const touchable = getByTestId('select-field-touchable');
        expect(touchable.props.accessibilityState.disabled).toBe(true);
    });
});
