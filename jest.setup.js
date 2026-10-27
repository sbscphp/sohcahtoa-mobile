// jest.setup.js
process.env.RNTL_SKIP_DEPS_CHECK = 'true';
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
    X: 'X',
    Info: 'Info',
    AlertCircle: 'AlertCircle',
    Clock: 'Clock',
    FileText: 'FileText',
    Sun: 'Sun',
    Moon: 'Moon',
    Smartphone: 'Smartphone',
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
    Lock: 'Lock',
    Sms: 'Sms',
    InfoCircle: 'InfoCircle',
    ShieldSecurity: 'ShieldSecurity',
    SearchNormal1: 'SearchNormal1',
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('expo-haptics', () => ({
    selectionAsync: jest.fn(() => Promise.resolve()),
    notificationAsync: jest.fn(() => Promise.resolve()),
    impactAsync: jest.fn(() => Promise.resolve()),
    NotificationFeedbackType: {
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
    },
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
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
        <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title}>
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
    return ({ label, value, onChangeText, placeholder, testID, editable, error }) => (
        <View>
            <Text>{label}</Text>
            <TextInput
                testID={testID || "input-field-input"}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                editable={editable}
            />
            {error && <Text>{error}</Text>}
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

jest.mock('expo-linking', () => ({
    createURL: jest.fn((path) => `sohcahtoa://${path}`),
    parse: jest.fn((url) => ({ queryParams: { code: 'test-code', state: 'test-state' } })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('expo-document-picker', () => ({
    getDocumentAsync: jest.fn(),
}));

jest.mock('react-native-webview', () => {
    const { View } = require('react-native');
    return {
        WebView: (props) => <View testID="webview" {...props} />,
    };
});

jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    },
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    })),
    useSegments: jest.fn(() => []),
    useLocalSearchParams: jest.fn(() => ({})),
    useGlobalSearchParams: jest.fn(() => ({})),
    Link: 'Link',
    Redirect: 'Redirect',
    Stack: 'Stack',
    Tabs: 'Tabs',
}));

jest.mock('react-native-gesture-handler', () => {
    const { View, ScrollView, FlatList, TouchableOpacity } = require('react-native');
    const panBuilder = {
        activeOffsetY: () => panBuilder,
        failOffsetX: () => panBuilder,
        onUpdate: () => panBuilder,
        onEnd: () => panBuilder,
        onStart: () => panBuilder,
    };
    return {
        GestureHandlerRootView: View,
        GestureDetector: ({ children }) => children,
        Gesture: {
            Pan: () => panBuilder,
            Tap: () => panBuilder,
            Simultaneous: () => panBuilder,
            Race: () => panBuilder,
            Exclusive: () => panBuilder,
        },
        ScrollView,
        FlatList,
        RectButton: TouchableOpacity,
        BorderlessButton: TouchableOpacity,
    };
});

jest.mock('react-native-worklets', () => ({
    scheduleOnRN: (fn, ...args) => fn?.(...args),
    scheduleOnUI: (fn, ...args) => fn?.(...args),
}));

jest.mock('react-native-reanimated', () => {
    const React = require('react');
    const { View, Text, Image, ScrollView, FlatList } = require('react-native');
    const chainableAnim = () => {
        const obj = {
            duration: () => obj,
            delay: () => obj,
            springify: () => obj,
            damping: () => obj,
            stiffness: () => obj,
            mass: () => obj,
            easing: () => obj,
        };
        return obj;
    };
    const Animated = {
        View,
        Text,
        Image,
        ScrollView,
        FlatList,
        createAnimatedComponent: (Component) => Component,
    };
    return {
        __esModule: true,
        default: Animated,
        ...Animated,
        useSharedValue: (init) => ({ value: init }),
        useAnimatedStyle: (fn) => fn(),
        useAnimatedScrollHandler: () => jest.fn(),
        useReducedMotion: () => false,
        withTiming: (toValue, _config, cb) => {
            if (cb) cb(true);
            return toValue;
        },
        withSpring: (toValue, _config, cb) => {
            if (cb) cb(true);
            return toValue;
        },
        interpolate: (val) => val,
        Extrapolation: {
            CLAMP: 'clamp',
            EXTEND: 'extend',
            IDENTITY: 'identity',
        },
        interpolateColor: (val, inputRange, outputRange) =>
            val >= inputRange[inputRange.length - 1]
                ? outputRange[outputRange.length - 1]
                : outputRange[0],
        Easing: {
            out: (fn) => fn,
            in: (fn) => fn,
            inOut: (fn) => fn,
            quad: (t) => t,
            cubic: (t) => t,
        },
        FadeIn: chainableAnim(),
        FadeOut: chainableAnim(),
        FadeInUp: chainableAnim(),
        FadeOutUp: chainableAnim(),
        FadeInDown: chainableAnim(),
        FadeOutDown: chainableAnim(),
        LinearTransition: chainableAnim(),
        ZoomIn: chainableAnim(),
        ZoomOut: chainableAnim(),
    };
});

jest.mock('expo-local-authentication', () => ({
    hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
    isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
    supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1, 2])),
    authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
    AuthenticationType: {
        FINGERPRINT: 1,
        FACIAL_RECOGNITION: 2,
        IRIS: 3,
    },
}));

jest.mock('expo-secure-store', () => {
    const store = new Map();
    return {
        setItemAsync: jest.fn((key, value) => {
            store.set(key, String(value));
            return Promise.resolve();
        }),
        getItemAsync: jest.fn((key) => Promise.resolve(store.get(key) ?? null)),
        deleteItemAsync: jest.fn((key) => {
            store.delete(key);
            return Promise.resolve();
        }),
        isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    };
});

// Mocking finished
