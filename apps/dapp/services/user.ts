import { UserCVType } from '../types';

export async function getCVServerSide(): Promise<UserCVType> {
  // Cette fonction est utilisée côté serveur pour récupérer le CV
  // Pour l'instant, elle retourne un objet vide qui sera complété par le composant
  return {
    school: '',
    degree: '',
    startDate: '',
    endDate: '',
    experiences: [],
  } as UserCVType;
}
