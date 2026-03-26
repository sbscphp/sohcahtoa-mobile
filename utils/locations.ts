export interface LocationItem {
    id: string;
    title: string;
    subtitle?: string;
}

export const STATES: LocationItem[] = [
    { id: '1', title: 'Lagos' },
    { id: '2', title: 'Ogun' },
    { id: '3', title: 'Rivers' },
    { id: '4', title: 'Kaduna' },
    { id: '5', title: 'Enugu' },
    { id: '6', title: 'Kano' },
];

export const CITIES: LocationItem[] = [
    { id: '1', title: 'Ajeromi' },
    { id: '2', title: 'Agege' },
    { id: '3', title: 'Alimosho' },
    { id: '4', title: 'Amuwo Odofin' },
    { id: '5', title: 'Apapa' },
    { id: '6', title: 'Badagry' },
];

export const LOCATIONS: LocationItem[] = [
    { id: '1', title: 'Ajeromi', subtitle: 'Femi Areola Street, Ikeja GRA.' },
    { id: '2', title: 'Agege', subtitle: 'Femi Areola Street, Ikeja GRA.' },
    { id: '3', title: 'Ikorodu', subtitle: '23 T.O.S Benson Avenue, Ikorodu.' },
    { id: '4', title: 'Festac', subtitle: '1st Avenue, Festac Town.' },
];
