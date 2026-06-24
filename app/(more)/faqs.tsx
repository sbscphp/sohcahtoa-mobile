import Header from '@/components/Header';
import InputField from '@/components/InputField';
import { useRouter } from 'expo-router';
import { AddCircle, MinusCirlce, SearchNormal1 } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

const faqs: FAQ[] = [
    {
        id: '1',
        question: 'What currencies do you support for exchange?',
        answer: 'We currently support major global currencies including USD, EUR, GBP, and CAD, paired with NGN. We are constantly working to add more currencies to our platform to better serve your needs.'
    },
    {
        id: '2',
        question: 'How long does a transaction take?',
        answer: 'Most transactions are processed instantly. However, depending on bank network stability, it may take up to a few minutes. If a transaction is pending for more than 15 minutes, please contact support.'
    },
    {
        id: '3',
        question: 'Is my personal information safe?',
        answer: 'Yes, your security is our top priority. We use industry-standard encryption and security protocols to protect your personal and financial information.'
    },
    {
        id: '4',
        question: 'How do I verify my identity?',
        answer: 'You can verify your identity by navigating to the "More" tab, selecting "Profile", and following the verification steps which include uploading a valid government-issued ID and a selfie.'
    },
    {
        id: '5',
        question: 'Can I cancel a pending transaction?',
        answer: 'Once a transaction is initiated and processing, it cannot be cancelled. If there is an issue with the transaction details, please contact our support team immediately.'
    },
];

const FAQItem = ({ item }: { item: FAQ }) => {

    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={styles.faqItem}>
            <TouchableOpacity
                style={styles.faqHeader}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Text style={styles.question}>{item.question}</Text>
                {expanded ? (
                    <MinusCirlce size={moderateScale(20)} color="#94A3B8" variant='Bold' />
                ) : (
                    <AddCircle size={moderateScale(20)} color="#94A3B8" variant='Bold' />
                )}
            </TouchableOpacity>
            {expanded && (
                <View style={styles.answerContainer}>
                    <Text style={styles.answer}>{item.answer}</Text>
                </View>
            )}
        </View>
    );
};

export default function FAQsScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Header title="Support" />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.introContainer}>
                    <Text style={styles.introTitle}>
                        Everything you need to know about sohcahtoa.
                    </Text>
                    <Text style={styles.introSubtitle}>
                        {"Can't find the answers you are looking for?"}
                    </Text>
                    <Text onPress={() => router.push('/(more)/support')} style={styles.linkText}> Chat Support</Text>
                </View>

                <InputField
                    label=""
                    placeholder="Search Question"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    icon={SearchNormal1}
                    wrapperStyle={styles.searchWrapper}
                />

                <View style={styles.listContainer}>
                    {filteredFAQs.map((faq) => (
                        <FAQItem key={faq.id} item={faq} />
                    ))}

                    {filteredFAQs.length === 0 && (
                        <Text style={styles.emptyText}>No results found</Text>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: '40@vs',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: '20@ms',
        paddingBottom: '40@vs',
    },
    introContainer: {
        marginBottom: '2@vs',
    },
    introTitle: {
        fontSize: '15@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '8@vs',
        lineHeight: '22@ms'
    },
    introSubtitle: {
        fontSize: '13@ms',
        color: '#0F172A',
        fontWeight: '500',
    },
    linkText: {
        color: '#F97316',
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
    searchWrapper: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        height: '48@vs',
        marginBottom: '24@vs',
    },
    listContainer: {
        gap: '16@vs'
    },
    faqItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: '16@vs',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16@s'
    },
    question: {
        flex: 1,
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#334155',
        lineHeight: '20@ms'
    },
    answerContainer: {
        marginTop: '12@vs',
    },
    answer: {
        fontSize: '13@ms',
        color: '#64748B',
        lineHeight: '20@ms',
    },
    emptyText: {
        textAlign: 'center',
        color: '#94A3B8',
        marginTop: '20@vs',
        fontSize: '14@ms'
    }
});
