// jest.setup.js
// import '@testing-library/react-native/extend-expect';

// Mocking ExpoImportMetaRegistry for Expo 54+ compatibility in Node environment
global.__ExpoImportMetaRegistry = new Map();

// Polyfill structuredClone if not available (fixes Expo 54+ issue)
if (typeof global.structuredClone !== 'function') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mocking common libraries
jest.mock('lucide-react-native', () => ({
    Download: 'Download',
    Check: 'Check',
    AlertCircle: 'AlertCircle',
    Clock: 'Clock',
}));

jest.mock('react-native-size-matters', () => ({
    ScaledSheet: {
        create: (styles) => styles,
    },
    moderateScale: (size) => size,
    verticalScale: (size) => size,
    scale: (size) => size,
}));

jest.mock('iconsax-react-nativejs', () => ({
    Calendar: 'Calendar',
    Clock: 'Clock',
    SearchStatus: 'SearchStatus',
    TickCircle: 'TickCircle',
    CloseCircle: 'CloseCircle',
    ArrowDown2: 'ArrowDown2',
    Edit2: 'Edit2',
    Eye: 'Eye',
    EyeSlash: 'EyeSlash',
    ArrowCircleLeft2: 'ArrowCircleLeft2',
    DocumentUpload: 'DocumentUpload',
    Folder: 'Folder',
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('@react-native-community/datetimepicker', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return ({ value, onChange, label }) => (
        <View testID="date-picker">
            <Text>{value.toDateString()}</Text>
            <TouchableOpacity onPress={() => onChange({}, new Date())}>
                <Text>Change Date</Text>
            </TouchableOpacity>
        </View>
    );
});

jest.mock('expo-image', () => ({
    Image: 'Image',
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/components/Header', () => {
    const { Text, View, Pressable } = require('react-native');
    return ({ title, onBackPress }) => (
        <View>
            <Pressable onPress={onBackPress}><Text>Back</Text></Pressable>
            <Text>{title}</Text>
        </View>
    );
});

jest.mock('@/components/ProgressBar', () => {
    const { View, Text } = require('react-native');
    return ({ progress, totalSteps }) => (
        <View>
            <Text>Step Indicator</Text>
        </View>
    );
});

jest.mock('@/components/PrimaryButton', () => {
    const { Text, Pressable } = require('react-native');
    return ({ title, onPress, disabled }) => (
        <Pressable onPress={onPress} disabled={disabled}>
            <Text>{title}</Text>
        </Pressable>
    );
});

jest.mock('@/components/CurrencyConverter', () => {
    const { Text } = require('react-native');
    return () => <Text>CurrencyConverter</Text>;
});

jest.mock('@/components/ControlledInput', () => {
    const { Text } = require('react-native');
    return ({ label }) => <Text>ControlledInput {label}</Text>;
});

jest.mock('@/components/DatePickerField', () => {
    const { Text } = require('react-native');
    return ({ label }) => <Text>DatePickerField {label}</Text>;
});

jest.mock('@/components/TimePickerField', () => {
    const { Text } = require('react-native');
    return ({ label }) => <Text>TimePickerField {label}</Text>;
});

jest.mock('@/components/LocationSelectionSheet', () => {
    const { Text } = require('react-native');
    return ({ title }) => <Text>LocationSelectionSheet {title}</Text>;
});

jest.mock('@/components/InputField', () => {
    const { Text, View, TextInput } = require('react-native');
    return ({ label, value, onChangeText, placeholder, testID, editable }) => (
        <View>
            <Text>{label}</Text>
            <TextInput
                testID={testID || "input-field-input"}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                editable={editable}
            />
        </View>
    );
});

jest.mock('@/components/SelectField', () => {
    const { Text } = require('react-native');
    return ({ label }) => <Text>SelectField {label}</Text>;
});

jest.mock('@/components/FileUpload', () => {
    const { Text } = require('react-native');
    return ({ title }) => <Text>FileUpload {title}</Text>;
});

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
    multiMerge: jest.fn(),
    flushGetRequests: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
    getDocumentAsync: jest.fn(),
}));

// Mocking finished
