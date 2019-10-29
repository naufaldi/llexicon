import { ReduxActions } from "../../constants.js"
import { DeepClone } from "../../helpers"

const defaultState = { items: [] }

export const Entries = (state = defaultState, action) => {
  const { id, shouldPost, shouldDelete, type, payload } = action
  switch (type) {
    case ReduxActions.ENTRIES_SET:
      return { ...state, items: payload }
    case ReduxActions.ENTRY_POST:
      return { ...state, items: [{ ...payload, shouldPost }, ...state.items] }
    case ReduxActions.ENTRY_UPDATE:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id
            ? {
                ...item,
                ...payload,
                lastUpdated: new Date(),
                shouldDelete
              }
            : item
        )
      }
    case ReduxActions.ENTRY_DELETE:
      return { ...state, items: state.items.filter(item => item.id !== id) }
    case ReduxActions.RESET_REDUX:
      return defaultState
    default:
      return state
  }
}
