import { ReduxActions } from "../../constants.js"
import { mergeJson } from "../../helpers"

const defaultState = { items: [] }

export const Entries = (state = defaultState, action) => {
  const { id, shouldPost, shouldDelete, type, payload } = action
  switch (type) {
    case ReduxActions.ENTRIES_SET:
      return { ...state, items: mergeJson(payload, state.items) }
    case ReduxActions.ENTRY_POST:
      return { ...state, items: mergeJson([{ ...payload, shouldPost }], state.items) }
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
    case ReduxActions.REDUX_RESET:
      return defaultState
    default:
      return state
  }
}