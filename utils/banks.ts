export const cleanBankName = (str: string): string =>
    (str || '')
        .toLowerCase()
        .replace(/\b(plc|limited|ltd|bank|microfinance|mgb|mfd)\b/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();

export const findBank = (bankName: string, banks: any[] = []): any | undefined => {
    const target = cleanBankName(bankName);
    return banks.find((b) => {
        const name = cleanBankName(b.name || b.label);
        return name === target || name.includes(target) || target.includes(name);
    });
};

export const isNigerianAccount = (account: any, banks: any[] = []): boolean => {
    const currency = (account.currency || '').toUpperCase();
    if (currency && currency !== 'NGN' && currency !== 'NAIRA') return false;
    if (account.isDomiciliary) return false;
    if (account.swiftCode || account.routingNumber || account.bankAddress || account.iban) return false;
    if (banks.length > 0 && !findBank(account.bankName, banks)) return false;
    return true;
};
