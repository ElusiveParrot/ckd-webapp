const initialMeasurements = null;

const measurements = (state = initialMeasurements, action) => {
  if (action.type === 'SET_MEASUREMENTS') {
    return [...action.payload];
  }

  if (action.type === 'ADD_MEASUREMENT') {
    return [...state, action.payload];
  }

  if (action.type === 'RESET_MEASUREMENTS') return null;

  return state;
};

export default measurements;
