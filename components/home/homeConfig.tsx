import React from 'react';
import { moderateScale } from 'react-native-size-matters';
import { Bank, Buildings, Hospital, ImportCircle, People, Teacher, User, WalletAdd1, WalletMinus } from 'iconsax-react-nativejs';
import Passport from '../../assets/images/passport.svg';
import StandingUser from '../../assets/images/standing-user.svg';

export const ACTION_BUTTONS = [
    { title: 'Buy FX', icon: WalletAdd1, type: 'buy' },
    { title: 'Sell FX', icon: WalletMinus, type: 'sell' },
    { title: 'Receive money', icon: ImportCircle, type: 'receive' },
];

export const FILTERS = ['FX bought', 'FX sold', 'Others'];

export const getTransactionRoute = (type: string): string => {
    const routes: Record<string, string> = {
        'PTA': '/(buy-fx)/(pta)/view-pta',
        'BTA': '/(buy-fx)/(bta)/view-bta',
        'MEDICAL': '/(buy-fx)/(medical)/view-medical',
        'SCHOOL_FEES': '/(buy-fx)/(school)/view-school',
        'PROFESSIONAL_BODY': '/(buy-fx)/(professional)/view-professional',
        'TOURING': '/(buy-fx)/(touring)/view-touring',
        'EXPATRIATE_FX': '/(sell-fx)/(expatriate)/view-expatriate',
        'RESIDENT_FX': '/(sell-fx)/(resident)/view-resident',
        'TOURIST_FX': '/(sell-fx)/(tourist)/view-tourist',
        'IMTO_REMITTANCE': '/(receive-fx)/view-receive-fx',
        'CASH_REMITTANCE': '/(receive-fx)/view-receive-fx',
    };
    return routes[type] || '/(buy-fx)/(pta)/view-pta';
};

export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 🌤️';
    if (hour < 17) return 'Good afternoon ☀️';
    return 'Good evening 🌙';
};

export interface SheetConfig {
    title: string;
    headerIcon: React.ReactNode;
    actions: Array<{
        id: string;
        title: string;
        subtitle: string;
        icon: React.ReactNode;
        onPress: () => void;
    }>;
}

export const getActionSheetConfig = (
    actionSheetType: 'buy' | 'sell' | 'receive' | null,
    handleActionPress: (action: string) => void,
    onReceiveMoneyPress: () => void,
): SheetConfig | null => {
    switch (actionSheetType) {
        case 'buy':
            return {
                title: 'Buy FX',
                headerIcon: <WalletMinus size={moderateScale(24)} color="#FF6B2C" />,
                actions: [
                    { id: '1', title: 'I am going on a Vacation (PTA)', subtitle: 'Buy FX to cover your travel and accommodation', icon: <User size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('vacation') },
                    { id: '2', title: 'I am travelling for business (BTA)', subtitle: 'Buy FX to cover your business trip abroad', icon: <Bank size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('business') },
                    { id: '3', title: 'Pay School Fees', subtitle: 'Pay tuition for undergraduate & postgraduate studies.', icon: <Teacher size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('school') },
                    { id: '4', title: 'Pay Medical Fees', subtitle: 'Pay for medical treatment or hospital bills abroad', icon: <Hospital size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('medical') },
                    { id: '5', title: 'Pay a Professional Body', subtitle: 'E.g International membership fee', icon: <People size={moderateScale(24)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('professional') },
                   
                ],
            };
        case 'sell':
            return {
                title: 'Sell FX',
                headerIcon: <WalletAdd1 size={moderateScale(24)} color="#FF6B2C" />,
                actions: [
                    { id: '1', title: 'Resident', subtitle: 'I have FX and want Naira', icon: <StandingUser width={moderateScale(20)} height={moderateScale(20)} color="#FF6B2C" />, onPress: () => handleActionPress('resident') },
                    { id: '2', title: 'Tourist', subtitle: 'I am touring Nigeria and want Naira', icon: <Passport width={moderateScale(20)} height={moderateScale(20)} color="#FF6B2C" />, onPress: () => handleActionPress('touring_inbound') },
                    { id: '3', title: 'Expatriate', subtitle: 'I am a foreigner living/working in Nigeria and want Naira', icon: <Buildings size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('expatriate') },
                ],
            };
        case 'receive':
            return {
                title: 'Receive FX',
                headerIcon: <WalletAdd1 size={moderateScale(24)} color="#FF6B2C" />,
                actions: [
                    { id: '1', title: 'Receive Money from Abroad', subtitle: 'Receive international transfer and fund money from relatives, business and associates', icon: <StandingUser width={moderateScale(20)} height={moderateScale(20)} color="#FF6B2C" />, onPress: onReceiveMoneyPress },
                ],
            };
        default:
            return null;
    }
};
