import { combineReducers } from 'redux';

import user from './user';
import measurements from './measurements';

const rootReducer = combineReducers({ user, measurements });

export default rootReducer;
