import { createFeatureSelector, createSelector} from '@ngrx/store';
import * as fromCommon from './common.reducers';

export const selectAuthData =
createFeatureSelector<fromCommon.AuthUserState>('authdata');

export const selectCommonData =
createFeatureSelector<fromCommon.CommonState>('commondata');

export const selectAuthStatus = createSelector(
    selectAuthData,
  (state: fromCommon.AuthUserState) => state
);

export const selectCommonStatus = createSelector(
    selectCommonData,
  (state: fromCommon.CommonState) => state
);