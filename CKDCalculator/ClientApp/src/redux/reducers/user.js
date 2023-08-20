const initialUser = null;

const user = (state = initialUser, action) => {
  if (action.type === 'SET_USER') {
    return { ...action.payload };
  }

  if (action.type === 'RESET_USER') return null;

  return state;
};

export default user;
