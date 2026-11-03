declare module Contact {
  export interface OfficeDay {
    day: string;
    openTime: string;
  }

  export interface OfficeHours {
    officeDay: OfficeDay[];
    infoNote?: string;
  }

  export interface Meeting {
    name: string;
    time: string;
  }

  export interface SacramentPreparationMettings {
    meeting: Meeting[];
    infoNote?: string;
  }

  export interface ContactDetails {
    address: string;
    email: string;
    googleMapEmbedLink: string;
    googleMapLink: string;
    iban: string;
    ico: string;
    id: number;
    mobil: string;
    phone: string;
    infoNote?: string;
  }

  export interface Contact {
    officeHours: OfficeHours;
    SacramentPreparationMettings: SacramentPreparationMettings;
    contactDetails: ContactDetails;
  }
}
