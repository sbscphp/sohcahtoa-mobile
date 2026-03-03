import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import FileUpload from '../components/FileUpload';

// Unmock the component
jest.unmock('../components/FileUpload');

describe('FileUpload', () => {
    const defaultProps = {
        onUpload: jest.fn(),
    };

    it('renders the default upload state correctly', () => {
        const { getByText } = render(<FileUpload {...defaultProps} />);
        expect(getByText('Upload or change here.')).toBeTruthy();
        expect(getByText('Browse')).toBeTruthy();
    });

    it('calls onUpload when the container is pressed in default state', () => {
        const { getByText } = render(<FileUpload {...defaultProps} />);
        fireEvent.press(getByText('Upload or change here.'));
        expect(defaultProps.onUpload).toHaveBeenCalled();
    });

    it('renders the file name when a file is provided', () => {
        const { getByText } = render(
            <FileUpload {...defaultProps} fileName="passport.pdf" />
        );
        expect(getByText('passport.pdf')).toBeTruthy();
        expect(getByText('Change')).toBeTruthy();
    });

    it('calls onUpload when the change button is pressed', () => {
        const { getByText } = render(
            <FileUpload {...defaultProps} fileName="passport.pdf" />
        );
        fireEvent.press(getByText('Change'));
        expect(defaultProps.onUpload).toHaveBeenCalled();
    });

    it('displays error message when provided', () => {
        const { getByText } = render(
            <FileUpload {...defaultProps} error="File too large" />
        );
        expect(getByText('File too large')).toBeTruthy();
    });
});
