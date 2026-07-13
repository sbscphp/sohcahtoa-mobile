import { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import { Transaction } from '@/types/api/transactions';

export const mapApiStatusToViewStatus = (status: string): TransactionStatus => {
    const map: Record<string, TransactionStatus> = {
        'DRAFT': 'pending',
        'AWAITING_VERIFICATION': 'pending',
        'VERIFICATION_IN_PROGRESS': 'pending',
        'VERIFICATION_COMPLETED': 'pending',
        'AWAITING_DEPOSIT': 'awaiting_disbursement',
        'DEPOSIT_PENDING': 'awaiting_disbursement',
        'DEPOSIT_CONFIRMED': 'awaiting_disbursement',
        'COMPLIANCE_REVIEW': 'pending',
        'ADMIN_APPROVAL_PENDING': 'pending',
        'APPROVED': 'approved',
        'DISBURSEMENT_IN_PROGRESS': 'awaiting_disbursement',
        'COMPLETED': 'settled',
        'REJECTED': 'rejected',
        'CANCELLED': 'rejected',
    };
    return map[status] || 'pending';
};

export const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    let d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        const slashParts = dateStr.split('/');
        if (slashParts.length === 3) {
            if (slashParts[0].length === 4) {
                const year = parseInt(slashParts[0], 10);
                const month = parseInt(slashParts[1], 10) - 1;
                const day = parseInt(slashParts[2], 10);
                d = new Date(year, month, day);
            } else {
                const day = parseInt(slashParts[0], 10);
                const month = parseInt(slashParts[1], 10) - 1;
                const year = parseInt(slashParts[2], 10);
                d = new Date(year, month, day);
            }
        } else {
            const dashParts = dateStr.split('-');
            if (dashParts.length === 3) {
                if (dashParts[0].length === 4) {
                    const year = parseInt(dashParts[0], 10);
                    const month = parseInt(dashParts[1], 10) - 1;
                    const day = parseInt(dashParts[2], 10);
                    d = new Date(year, month, day);
                } else if (dashParts[2].length === 4) {
                    const day = parseInt(dashParts[0], 10);
                    const month = parseInt(dashParts[1], 10) - 1;
                    const year = parseInt(dashParts[2], 10);
                    d = new Date(year, month, day);
                }
            }
        }
    }
    if (isNaN(d.getTime())) {
        return dateStr;
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

export const formatTimeWithSeconds = (dateStr: string): string => {
    const d = new Date(dateStr);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes}:${seconds} ${ampm}`;
};

export const formatCurrency = (amount: number | null | undefined, prefix: string = '₦'): string => {
    if (amount == null) return `${prefix} 0`;
    const num = Number(amount);
    if (isNaN(num)) return `${prefix} 0`;
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${prefix} ${parts.join('.')}`;
};

export const truncateFileName = (name: string, maxLength: number = 25): string => {
    if (!name) return '';
    if (name.length <= maxLength) return name;

    const extIndex = name.lastIndexOf('.');
    if (extIndex > -1 && name.length - extIndex <= 5) {
        const ext = name.slice(extIndex);
        const nameWithoutExt = name.slice(0, extIndex);
        const charsToKeep = maxLength - ext.length - 3;

        if (charsToKeep > 0) {
            return `${nameWithoutExt.slice(0, charsToKeep)}...${ext}`;
        }
    }

    return `${name.slice(0, maxLength - 3)}...`;
};
export const commonDocTypeLabels: Record<string, string> = {
    'VISA': 'Valid Visa',
    'PASSPORT': 'International Passport',
    'FORM_A': 'Form A',
    'FORM_A_DOCUMENT': 'Form A',
    'RETURN_TICKET': 'Return Ticket',
    'INTERNATIONAL_PASSPORT': 'International Passport',
    'TIN': 'TIN',
    'TCC': 'TCC',
    'CORPORATE_BODY_LETTER': 'Letter of Request from Employer',
    'PARTNER_INVITATION_LETTER': 'Letter of Invitation from Overseas Partner',
    'SCHOOL_ADMISSION': 'School Admission',
    'MEDICAL_LETTER': 'Medical Letter',
    'OVERSEAS_MEDICAL_LETTER': 'Overseas Medical Letter',
    'PROFESSIONAL_BODY_LETTER': 'Professional Body Letter',
    'MEMBERSHIP_CARD': 'Membership Card',
    'INVOICE': 'Invoice',
    'RECEIPT': 'Receipt',
    'STUDENT_PASSPORT': 'Student International Passport',
    'PROOF_OF_FUNDS': 'Proof of Funds',
    'DIGITAL_SIGNATURE': 'Declaration Document (Signature)',
};

export const getTransactionDocuments = (tx: any): { label: string; value: string }[] => {
    if (!tx) return [];
    const docs: { label: string; value: string }[] = [];

    const getValue = (primaryVal: any, stepKeys: string[]): string | null => {
        if (primaryVal !== undefined && primaryVal !== null && primaryVal !== '') {
            return String(primaryVal);
        }
        if (tx.steps && Array.isArray(tx.steps)) {
            for (const step of tx.steps) {
                if (step.data && typeof step.data === 'object') {
                    for (const key of stepKeys) {
                        const keys = key.split('.');
                        let current = step.data;
                        for (const k of keys) {
                            if (current && typeof current === 'object') {
                                current = current[k];
                            } else {
                                current = undefined;
                                break;
                            }
                        }
                        if (current !== undefined && current !== null && current !== '') {
                            return String(current);
                        }
                    }
                }
            }
        }
        return null;
    };

    const bvn = getValue(tx.personalInfo?.bvn, ['bvn']);
    const nin = getValue(tx.personalInfo?.nin, ['nin']);
    const admissionType = getValue(tx.personalInfo?.admissionType, ['admissionType']);

    const tin = getValue(tx.taxClearanceNumber || tx.personalInfo?.tinNumber, ['tinNumber', 'taxClearanceNumber']);
    const formAId = getValue(tx.formAId, ['formAId']);
    const passport = getValue(tx.personalInfo?.passportDocumentNumber || tx.personalInfo?.passportDocumentNumber, ['passportDocumentNumber', 'passportDocumentNumber']);
    const passportIssueDate = getValue(tx.personalInfo?.passportIssueDate, ['passportIssueDate']);
    const passportExpiryDate = getValue(tx.personalInfo?.passportExpiryDate, ['passportExpiryDate']);
    const schoolInvoiceNumber = getValue(tx.beneficiaryDetails?.admissionNumber, ['admissionNumber', 'beneficiaryDetails.admissionNumber']);

    if (bvn && tx.type !== 'TOURING' && tx.type !== 'TOURIST_FX') docs.push({ label: 'BVN Number', value: bvn });
    if (nin && tx.type !== 'TOURIST_FX') docs.push({ label: 'NIN', value: nin });
    if (admissionType) docs.push({ label: 'Admission Type', value: admissionType });
    if (tin && tx.type !== 'TOURIST_FX' && tx.type !== 'SCHOOL_FEES' && tx.type !== 'EXPATRIATE_FX' && tx.type !== 'PTA' && tx.type !== 'PROFESSIONAL' && tx.type !== 'PROFESSIONAL_BODY') docs.push({ label: 'TIN', value: tin });
    if (formAId) docs.push({ label: 'Form A ID', value: formAId });
    if (passport) docs.push({ label: 'International Passport Number', value: passport });
    if (passportIssueDate) docs.push({ label: 'Passport Issue Date', value: passportIssueDate });
    if (passportExpiryDate) docs.push({ label: 'Passport Expiry Date', value: passportExpiryDate });
    if (schoolInvoiceNumber) docs.push({ label: 'School Invoice Number', value: schoolInvoiceNumber });

    const declarationInitials = getValue(tx.declarationInitials || tx.personalInfo?.declarationInitials, ['declarationInitials', 'personalInfo.declarationInitials']);
    if (declarationInitials) docs.push({ label: 'Declaration Initials', value: declarationInitials });

    return docs;
};

export const getStatusLabel = (status: string): string => {
    const map: Record<string, string> = {
        'DRAFT': 'Draft',
        'AWAITING_VERIFICATION': 'Awaiting Verification',
        'VERIFICATION_IN_PROGRESS': 'Verification In Progress',
        'VERIFICATION_COMPLETED': 'Verification Completed',
        'AWAITING_DEPOSIT': 'Awaiting Deposit',
        'DEPOSIT_PENDING': 'Deposit Pending',
        'DEPOSIT_CONFIRMED': 'Deposit Confirmed',
        'COMPLIANCE_REVIEW': 'Compliance Review',
        'ADMIN_APPROVAL_PENDING': 'Admin Approval Pending',
        'AWAITING_REFUND_VERIFICATION': 'Awaiting Refund Verification',
        'AWAITING_DISBURSEMENT': 'Awaiting Disbursement',
        'APPROVED': 'Approved',
        'DISBURSEMENT_IN_PROGRESS': 'Disbursement In Progress',
        'COMPLETED': 'Completed',
        'REJECTED': 'Rejected',
        'CANCELLED': 'Cancelled',
    };
    return map[status] || status;
};

export const getStatusStyle = (status: string) => {
    switch (status) {
        case 'AWAITING_VERIFICATION':
        case 'AWAITING_DEPOSIT':
        case 'DEPOSIT_PENDING':
        case 'ADMIN_APPROVAL_PENDING':
        case 'AWAITING_DISBURSEMENT':
        case 'Pending':
        case 'Awaiting Verification':
        case 'Awaiting Deposit':
        case 'Deposit Pending':
        case 'Admin Approval Pending':
        case 'Awaiting Disbursement':
        case 'Awaiting Refund Verification':
            return { color: '#B54708', bg: '#FFFAEB', backgroundColor: '#FFFAEB' };
        case 'VERIFICATION_IN_PROGRESS':
        case 'VERIFICATION_COMPLETED':
        case 'DEPOSIT_CONFIRMED':
        case 'COMPLIANCE_REVIEW':
        case 'DISBURSEMENT_IN_PROGRESS':
        case 'In Progress':
        case 'Verification In Progress':
        case 'Verification Completed':
        case 'Deposit Confirmed':
        case 'Compliance Review':
        case 'Disbursement In Progress':
            return { color: '#3538CD', bg: '#EEF4FF', backgroundColor: '#EEF4FF' };
        case 'REJECTED':
        case 'CANCELLED':
        case 'Declined':
        case 'Rejected':
        case 'Cancelled':
            return { color: '#B42318', bg: '#FEF3F2', backgroundColor: '#FEF3F2' };
        case 'APPROVED':
        case 'COMPLETED':
        case 'Approved':
        case 'Settled':
        case 'Completed':
            return { color: '#027A48', bg: '#ECFDF3', backgroundColor: '#ECFDF3' };
        case 'DRAFT':
        case 'Draft':
            return { color: '#344054', bg: '#F2F4F7', backgroundColor: '#F2F4F7' };
        default:
            return { color: '#344054', bg: '#F2F4F7', backgroundColor: '#F2F4F7' };
    }
};

export const formatListDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
};

export const formatListTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}${minutes > 0 ? ':' + String(minutes).padStart(2, '0') : ''} ${ampm}`;
};

export const formatAmount = (amount: number, currency: string): string => {
    const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'NGN' ? '₦' : currency;
    const num = Number(amount);
    if (isNaN(num)) return `${symbol}0`;
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${symbol}${parts.join('.')}`;
};

export const getSectionTitle = (dateStr: string): string => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach((tx) => {
        const dateKey = new Date(tx.createdAt).toDateString();
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(tx);
    });
    return Object.entries(groups).map(([_, data]) => ({
        title: getSectionTitle(data[0].createdAt),
        data,
    }));
};

export const formatDateToPickerFormat = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                if (parts[0].length === 4) return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
                if (parts[2].length === 4) return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
            }
            return '';
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return '';
    }
};

export const getNotificationRoute = (
    actionUrl?: string | null,
    data?: any,
    transactions: any[] = [],
    title?: string,
    body?: string
): { pathname: string; params: { transactionId: string } } | null => {
    let payloadData = data;
    if (typeof payloadData === 'string') {
        try {
            payloadData = JSON.parse(payloadData);
        } catch (e) {}
    }

    let transactionId = payloadData?.transactionId || payloadData?.transaction_id || payloadData?.id;
    let transactionType = payloadData?.transactionType || payloadData?.transaction_type || payloadData?.type;

    if (actionUrl) {
        const idMatch = actionUrl.match(/[?&](transactionId|transaction_id|id)=([^&]+)/);
        if (idMatch && idMatch[2]) {
            transactionId = decodeURIComponent(idMatch[2]);
        }
        const typeMatch = actionUrl.match(/[?&](transactionType|transaction_type|type)=([^&]+)/);
        if (typeMatch && typeMatch[2]) {
            transactionType = decodeURIComponent(typeMatch[2]);
        }

        // If we still don't have transactionId, try to extract it from the path segments of actionUrl
        if (!transactionId) {
            const pathPart = actionUrl.split('?')[0];
            const segments = pathPart.split('/').filter(Boolean);
            // Search for a segment that looks like a UUID or a sequence of digits (length > 5 or all digits)
            for (let i = segments.length - 1; i >= 0; i--) {
                const seg = segments[i];
                if (seg && (seg.length > 5 || /^\d+$/.test(seg))) {
                    transactionId = seg;
                    break;
                }
            }
        }
    }

    // Lookup in transaction list if type is missing but we have transactionId
    if (transactionId && !transactionType && Array.isArray(transactions) && transactions.length > 0) {
        const tx = transactions.find(t => String(t.id || t.transactionId || '') === String(transactionId));
        if (tx) {
            transactionType = tx.type;
        }
    }

    // Guess from title / body if type is still missing
    if (transactionId && !transactionType && (title || body)) {
        const text = `${title || ''} ${body || ''}`.toLowerCase();
        if (text.includes('school') || text.includes('admission') || text.includes('education')) {
            transactionType = 'SCHOOL_FEES';
        } else if (text.includes('expatriate') || text.includes('expat')) {
            transactionType = 'EXPATRIATE_FX';
        } else if (text.includes('resident')) {
            transactionType = 'RESIDENT_FX';
        } else if (text.includes('tourist')) {
            transactionType = 'TOURIST_FX';
        } else if (text.includes('touring') || text.includes('tour')) {
            transactionType = 'TOURING';
        } else if (text.includes('bta') || text.includes('business travel')) {
            transactionType = 'BTA';
        } else if (text.includes('pta') || text.includes('personal travel')) {
            transactionType = 'PTA';
        } else if (text.includes('medical') || text.includes('hospital') || text.includes('health')) {
            transactionType = 'MEDICAL';
        } else if (text.includes('professional') || text.includes('membership')) {
            transactionType = 'PROFESSIONAL_BODY';
        } else if (text.includes('remittance') || text.includes('receive') || text.includes('imto')) {
            transactionType = 'IMTO_REMITTANCE';
        }
    }

    const routes: Record<string, string> = {
        'SCHOOL_FEES': '/(buy-fx)/(school)/view-school',
        'EXPATRIATE_FX': '/(sell-fx)/(expatriate)/view-expatriate',
        'RESIDENT_FX': '/(sell-fx)/(resident)/view-resident',
        'TOURIST_FX': '/(sell-fx)/(tourist)/view-tourist',
        'TOURING': '/(buy-fx)/(touring)/view-touring',
        'BTA': '/(buy-fx)/(bta)/view-bta',
        'PTA': '/(buy-fx)/(pta)/view-pta',
        'MEDICAL': '/(buy-fx)/(medical)/view-medical',
        'PROFESSIONAL': '/(buy-fx)/(professional)/view-professional',
        'PROFESSIONAL_BODY': '/(buy-fx)/(professional)/view-professional',
        'RECEIVE_FX': '/(receive-fx)/view-receive-fx',
        'IMTO_REMITTANCE': '/(receive-fx)/view-receive-fx',
        'CASH_REMITTANCE': '/(receive-fx)/view-receive-fx',
    };

    const getMappedRouteFromPath = (path: string): string | null => {
        const clean = path.toLowerCase();
        if (clean.includes('view-school')) return '/(buy-fx)/(school)/view-school';
        if (clean.includes('view-expatriate')) return '/(sell-fx)/(expatriate)/view-expatriate';
        if (clean.includes('view-resident')) return '/(sell-fx)/(resident)/view-resident';
        if (clean.includes('view-tourist')) return '/(sell-fx)/(tourist)/view-tourist';
        if (clean.includes('view-touring')) return '/(buy-fx)/(touring)/view-touring';
        if (clean.includes('view-bta')) return '/(buy-fx)/(bta)/view-bta';
        if (clean.includes('view-pta')) return '/(buy-fx)/(pta)/view-pta';
        if (clean.includes('view-medical')) return '/(buy-fx)/(medical)/view-medical';
        if (clean.includes('view-professional')) return '/(buy-fx)/(professional)/view-professional';
        if (clean.includes('view-receive')) return '/(receive-fx)/view-receive-fx';
        return null;
    };

    let targetRoute = null;
    if (actionUrl) {
        targetRoute = getMappedRouteFromPath(actionUrl);
    }
    if (!targetRoute && transactionType) {
        const normalizedType = String(transactionType).toUpperCase().trim();
        targetRoute = routes[normalizedType];
    }

    if (targetRoute && transactionId) {
        return {
            pathname: targetRoute,
            params: { transactionId }
        };
    }

    return null;
};

