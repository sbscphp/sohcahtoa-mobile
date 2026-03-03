import { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';

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
    const d = new Date(dateStr);
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

export const formatCurrency = (amount: number | null | undefined, prefix: string = '₦'): string => {
    if (amount == null) return `${prefix} 0`;
    return `${prefix} ${amount.toLocaleString()}`;
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
    'CORPORATE_BODY_LETTER': 'Corporate Body Letter',
    'PARTNER_INVITATION_LETTER': 'Partner Invitation Letter',
    'SCHOOL_ADMISSION': 'School Admission',
    'MEDICAL_LETTER': 'Medical Letter',
    'OVERSEAS_MEDICAL_LETTER': 'Overseas Medical Letter',
    'PROFESSIONAL_BODY_LETTER': 'Professional Body Letter',
    'MEMBERSHIP_CARD': 'Membership Card',
    'INVOICE': 'Invoice',
    'RECEIPT': 'Receipt',
};

export const getTransactionDocuments = (tx: any): { label: string; value: string }[] => {
    if (!tx) return [];
    const docs: { label: string; value: string }[] = [];

    // Personal Info fields
    if (tx.personalInfo?.bvn) docs.push({ label: 'BVN Number', value: tx.personalInfo.bvn });
    if (tx.personalInfo?.nin) docs.push({ label: 'NIN', value: tx.personalInfo.nin });
    if (tx.personalInfo?.admissionType) docs.push({ label: 'Admission Type', value: tx.personalInfo.admissionType });

    // Root level fields
    if (tx.taxClearanceNumber) docs.push({ label: 'TIN', value: tx.taxClearanceNumber });
    if (tx.formAId) docs.push({ label: 'Form A ID', value: tx.formAId });

    return docs;
};
