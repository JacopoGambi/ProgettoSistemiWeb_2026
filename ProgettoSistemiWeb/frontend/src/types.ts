export interface dettaglicamera {
    idcamera: number
    nomecamera: string
    descrizionecamera: string
    imgcamera: string
    prezzocamera: number
}

//camera
export interface prenotazioni {
    idprenotazione: number;
    idcamera: number;
    username: string; 
    datainizio: string;
    datafine: string;
    ospiti: number;
}

  //ristorante
export interface prenotazioni_ristorante {
    idtavolo: number;
    username: string;
    ospiti: number;
    data: string;
    ora: string;
}

//spiaggia
export interface prenotazioni_spiaggia {
    idprenotazione: number;
    username: string;
    ombrellone: string;
    datainizio: string;
    datafine: string;
}

//utenti
export interface utenti {
    username: string;
    password: string;
    ruolo: string;
    nome: string;
}

//recensioni
export interface recensioni {
    idRecensione: number;
    username: string;
    testo: string;
    voto: number;
}

//menu
export interface Menu {
    idpiatto: number;
    piatto: string;
    descrizionepiatto: string;
    prezzopiatto: number;
    editing?: boolean;
    original?: {
      piatto: string;
      descrizionepiatto: string;
      prezzopiatto: number;
    };
  }
 
  //chat
  export interface ChatMessage {
    id: string;
    username: string;
    userType: 'cliente' | 'dipendente';
    message: string;
    timestamp: Date;
  }
  
  //utenti connessi
  export interface ConnectedUser {
    socketId: string;
    username: string;
    userType: 'cliente' | 'dipendente';
  } 