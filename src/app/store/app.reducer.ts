import { ActionReducerMap } from '@ngrx/store';
import * as fromCommon from './common.reducers';

export interface AppState {
    commondata: fromCommon.CommonState;
    authdata: fromCommon.AuthUserState;
}

export const appReducer: ActionReducerMap<AppState> = {
    commondata: fromCommon.commondatareducer,
    authdata: fromCommon.commonuserreducer
}