declare module Contact {
  export interface OfficeDay {
    day: string;
    id: number;
    openTime: string;
  }

  export interface OfficeHours {
    officeDay: OfficeDay[];
  }

  export interface Meeting {
    name: string;
    time: string;
  }

  export interface SacramentPreparationMettings {
    meeting: Meeting[];
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
  }

  export interface Contact {
    officeHours: OfficeHours;
    SacramentPreparationMettings: SacramentPreparationMettings;
    contactDetails: ContactDetails;
  }
}
