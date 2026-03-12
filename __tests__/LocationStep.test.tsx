import { render } from '@testing-library/react-native';
import React from 'react';
import LocationStep from '../components/transaction-flow/LocationStep';

describe('LocationStep', () => {
    const defaultProps = {
        states: [{ id: '1', title: 'Lagos' }],
        cities: [{ id: '1', title: 'Ikeja' }],
        locations: [{ id: '1', title: 'Bank Branch A' }],
        selectedState: null,
        onSelectState: jest.fn(),
        selectedCity: null,
        onSelectCity: jest.fn(),
        selectedLocation: null,
        onSelectLocation: jest.fn(),
    };

    it('renders the title', () => {
        const { getByText } = render(<LocationStep {...defaultProps} />);
        expect(getByText('Where would you like to pick up your card and cash?')).toBeTruthy();
    });

    it('renders dropdown labels excluding sheets', () => {
        const { getAllByText } = render(<LocationStep {...defaultProps} />);
        // "State *" is the label, regex /State/ matches it and "LocationSelectionSheet Select State"
        // But getByText with /Select a City/ should work.
        expect(getAllByText(/State/).length).toBeGreaterThan(0);
        expect(getAllByText(/Select a City/).length).toBeGreaterThan(0);
    });

    it('renders DatePicker and TimePicker mocks', () => {
        const { getByText } = render(<LocationStep {...defaultProps} />);
        expect(getByText(/DatePickerField Pickup Date/)).toBeTruthy();
        expect(getByText(/TimePickerField Pickup Time/)).toBeTruthy();
    });

    it('shows location count when state and city are selected', () => {
        const props = {
            ...defaultProps,
            selectedState: { id: '1', title: 'Lagos' },
            selectedCity: { id: '1', title: 'Ikeja' },
        };
        const { getByText } = render(<LocationStep {...props} />);
        expect(getByText('1 Pickup Points Available')).toBeTruthy();
    });
});
