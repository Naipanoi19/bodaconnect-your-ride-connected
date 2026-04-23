export interface MockDriver {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  hasHelmet: boolean;
  eta: number;
  totalRides: number;
  phone: string;
  plate: string;
}

export const MOCK_DRIVERS: MockDriver[] = [
  { id: "1", name: "James Kamau", lat: -1.3965, lng: 36.7441, rating: 4.8, hasHelmet: true, eta: 3, totalRides: 234, phone: "+254712345678", plate: "KCB 234X" },
  { id: "2", name: "Peter Odhiambo", lat: -1.399, lng: 36.7467, rating: 4.5, hasHelmet: true, eta: 5, totalRides: 189, phone: "+254723456789", plate: "KDH 552Y" },
  { id: "3", name: "Samuel Njoroge", lat: -1.3955, lng: 36.748, rating: 4.2, hasHelmet: false, eta: 7, totalRides: 156, phone: "+254734567890", plate: "KCA 901Z" },
  { id: "4", name: "Daniel Kipchoge", lat: -1.4001, lng: 36.7438, rating: 4.9, hasHelmet: true, eta: 2, totalRides: 412, phone: "+254745678901", plate: "KMEA 088" },
  { id: "5", name: "Brian Otieno", lat: -1.397, lng: 36.7495, rating: 4.6, hasHelmet: true, eta: 4, totalRides: 298, phone: "+254756789012", plate: "KCT 716R" },
];

export const RONGAI_CENTER: [number, number] = [-1.3978, 36.7453];