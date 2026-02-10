import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    ImageSourcePropType,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';


const { width } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    title: string;
    subtitle: string;
    testimonial: string;
    author: string;
    role: string;
    image: string;
    bgImage: ImageSourcePropType;
}

const ONBOARDING_DATA: OnboardingSlide[] = [
    {
        id: '1',
        title: 'Exchange Money\nthe Right Way',
        subtitle: 'Trusted, transparent & secure.',
        testimonial: 'SohCahToa makes managing my small FX needs simple. The rates are fair, the process is quick, and I never worry about delays. It\'s the most reliable platform I\'ve used',
        author: 'Adekunle, Ibrahim',
        role: 'Student',
        image: require('../assets/images/user-img-1.jpg'),
        bgImage: require('../assets/images/onboard-img-1.png'),
    },
    {
        id: '2',
        title: 'Straight forward\nForeign Exchange',
        subtitle: 'Buy & sell at fair rates.',
        testimonial: 'As someone working abroad, I need a platform I can trust for regular currency exchanges. SohCahToa delivers every time, secure, clear, and consistently dependable',
        author: 'Feubode Gesikeme',
        role: 'Expatriate',
        image: require('../assets/images/user-img-2.jpg'),
        bgImage: require('../assets/images/onboard-img-2.png'),
    },
    {
        id: '3',
        title: 'Your Trusted FX\nPartner',
        subtitle: 'Reliable FX built on trust and compliance.',
        testimonial: 'SohCahToa has been the most trustworthy place for my FX needs. The process is smooth, the rates are honest, and I always feel secure using their platform',
        author: 'Moshood Aremu',
        role: 'Head of Project, SBSC',
        image: require('../assets/images/user-img-3.jpg'),
        bgImage: require('../assets/images/onboard-img-3.png'),
    },
];

export interface OnboardingScreenProps {
    onSignUp: () => void;
    onLogin: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSignUp, onLogin }) => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const insets = useSafeAreaInsets();

    
    useEffect(() => {
        const timer = setInterval(() => {
            if (activeIndex < ONBOARDING_DATA.length - 1) {
                flatListRef.current?.scrollToIndex({
                    index: activeIndex + 1,
                    animated: true,
                });
            } else {
                flatListRef.current?.scrollToIndex({
                    index: 0,
                    animated: true,
                });
            }
        }, 5000); 

        return () => clearInterval(timer);
    }, [activeIndex]);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const renderItem = ({ item, index }: { item: OnboardingSlide, index: number }) => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
        });


        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.slideWrapper}>
                <View style={styles.slideContainer}>
                    <View style={styles.logoPlaceholder}>
                        <Image
                            source={require('../assets/images/logo-s.png')}
                            style={styles.logo}
                        />
                    </View>
                    <Animated.View style={[styles.imageContainer, { opacity, transform: [{ scale }] }]}>

                       
                        <View style={styles.titleOverlay}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.subtitle}>{item.subtitle}</Text>
                        </View>

                        
                        <View style={styles.testimonialCard}>
                            <Text style={styles.testimonialText} numberOfLines={4}>{item.testimonial}</Text>
                            <View style={styles.authorContainer}>
                                <Image source={item.image as any} style={styles.authorAvatar} />
                                <View>
                                    <Text style={styles.authorName}>{item.author}</Text>
                                    <Text style={styles.authorRole}>{item.role}</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                    <View style={styles.paginationContainer}>
                        {ONBOARDING_DATA.map((_, index) => {
                            const opacity = scrollX.interpolate({
                                inputRange: [
                                    (index - 1) * width,
                                    index * width,
                                    (index + 1) * width,
                                ],
                                outputRange: [0.3, 1, 0.3],
                                extrapolate: 'clamp',
                            });

                            const scale = scrollX.interpolate({
                                inputRange: [
                                    (index - 1) * width,
                                    index * width,
                                    (index + 1) * width,
                                ],
                                outputRange: [0.8, 1.2, 0.8],
                                extrapolate: 'clamp',
                            });

                            return (
                                <Animated.View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        { opacity, transform: [{ rotate: '45deg' }, { scale }] },
                                        activeIndex === index && styles.activeDot,
                                    ]}
                                />
                            );
                        })}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.contentContainer}>
                <FlatList
                    ref={flatListRef}
                    data={ONBOARDING_DATA}
                    renderItem={renderItem}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    keyExtractor={(item) => item.id}
                    scrollEventThrottle={16}
                    bounces={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
                />
            </View>

            {/* Sticky Footer */}
            <View style={styles.footer}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.signUpButton}
                        onPress={onSignUp}
                        accessible={true}
                        accessibilityLabel="Sign Up"
                        accessibilityRole="button"
                    >
                        <Text style={styles.signUpButtonText}>Sign Up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={onLogin}
                        accessible={true}
                        accessibilityLabel="Log in"
                        accessibilityRole="button"
                    >
                        <Text style={styles.loginButtonText}>Log in</Text>
                    </TouchableOpacity>
                </View>

                {/* License */}
                <View style={styles.licenseContainer}>
                    <Image source={require('../assets/images/cbn.png')} style={styles.licenseImage} />
                    <Text style={styles.licenseText}>Licensed by CBN</Text>
                </View>
            </View>
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingHorizontal: '20@s',
        paddingVertical: '10@vs',
        backgroundColor: '#F8F9FA',
    },
    logoPlaceholder: {
        width: '100%',
        height: '80@ms',
        marginLeft: '-16@s',
        top: '-2@vs',
    },
    contentContainer: {
        flex: 1,
    },
    slideWrapper: {
        width: width,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    slideContainer: {
        width: '95%',
        height: '100%',
        alignItems: 'center',
        borderRadius: '16@ms',
        backgroundColor: 'rgba(241, 241, 241, 1)',

    },
    imageContainer: {
        width: '100%',
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    titleOverlay: {
        position: 'absolute',
        top: '2@vs',
        left: '10@s',
        right: '10@s',
        // backgroundColor: '#00000080',
        // padding: '10@ms',
        borderRadius: '8@ms',
    },
    title: {
        fontSize: '34@ms',
        fontWeight: '700',
        color: '#050404ff',
        marginBottom: '4@vs',
    },
    subtitle: {
        fontSize: '14@ms',
        color: '#080808ff',
        marginTop: '8@vs',
    },
    testimonialCard: {
        position: 'absolute',
        bottom: '6@vs',
        left: '10@s',
        right: '10@s',
        backgroundColor: '#FFFFFF',
        borderRadius: '12@ms',
        padding: '20@ms',
        marginBottom: '4@vs',
    },
    testimonialText: {
        fontSize: '13@ms',
        color: '#475569',
        lineHeight: '20@ms',
        marginBottom: '16@vs',
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: '36@ms',
        height: '36@ms',
        borderRadius: '18@ms',
        backgroundColor: '#E2E8F0',
        marginRight: '12@ms',
    },
    authorName: {
        fontSize: '14@ms',
        fontWeight: '700',
        color: '#1E293B',
    },
    authorRole: {
        fontSize: '12@ms',
        color: '#94A3B8',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '1@vs',
        marginBottom: '15@vs',
    },
    dot: {
        height: '7@ms',
        width: '7@ms',
        backgroundColor: 'rgba(105, 105, 105, 1)',
        marginHorizontal: '8@ms',
    },
    activeDot: {
        backgroundColor: '#FF6B2C',
    },
    footer: {
        paddingHorizontal: '20@s',
        paddingBottom: '10@vs',
        paddingTop: '10@vs',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: '16@s',
        marginBottom: '16@vs',
    },
    signUpButton: {
        flex: 1,
        backgroundColor: '#FF6B2C',
        height: '42@vs',
        borderRadius: '50@ms',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpButtonText: {
        color: '#FFFFFF',
        fontSize: '14@ms',
        fontWeight: '500',
    },
    loginButton: {
        flex: 1,
        backgroundColor: 'rgba(243, 243, 243, 1)',
        height: '42@vs',
        borderRadius: '50@ms',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#1E293B',
        fontSize: '14@ms',
        fontWeight: '500',
    },
    licenseContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    licenseText: {
        fontSize: '12@ms',
        color: '#64748B',
        fontWeight: '500',
    },
    logo: {
        width: '140@ms',
        height: '100%',
        resizeMode: 'contain',
    },
    licenseImage: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    },
});

export default OnboardingScreen;
