import {IGenericEntity} from '../shared/entity-model';
import {CoaType} from '../../../shared/Infrastructure/constants/constants';

export interface ICoaModel extends IGenericEntity {
  // type: CoaType
  projects: number,
  engagements: IGenericEntity[],
  globalCoaId?: string,
  projectCount: number
}
