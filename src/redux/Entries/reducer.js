import { EntriesActionTypes } from "../Entries/types"
import { AppActionTypes } from "../App/types"
import { handleFilterEntries } from "./utils"
import { mergeJson } from "../../helpers"

const DEFAULT_STATE_ENTRIES = {
  count: null,
  next: null,
  previous: null,
  items: [],
  filteredItems: [],
  isPending: false,
  error: null,
  search: "",
  EntryTags: [],
  EntryPeople: [],
  sortMap: {
    date_updated: true,
  },
  filterMap: {},
}

const Entries = (state = DEFAULT_STATE_ENTRIES, action) => {
  const { id, type, payload, search, _lastUpdated } = action
  switch (type) {
    case EntriesActionTypes.ENTRIES_SET_TAGS:
      return { ...state, EntryTags: payload }
    case EntriesActionTypes.ENTRIES_SET_PEOPLE:
      return { ...state, EntryPeople: payload }
    case EntriesActionTypes.ENTRIES_SEARCH_FILTER:
      return {
        ...state,
        ...handleFilterEntries(
          mergeJson(state.items.concat(state.filteredItems), payload),
          search
        ),
        search,
      }
    case EntriesActionTypes.ENTRIES_PENDING:
      return { ...state, isPending: true }
    case EntriesActionTypes.ENTRIES_ERROR:
      return { ...state, isPending: false, error: payload }
    case EntriesActionTypes.ENTRIES_COMPLETE:
      return { ...state, isPending: false, error: DEFAULT_STATE_ENTRIES.error }
    case EntriesActionTypes.ENTRY_IMPORT:
      return {
        ...state,
        items: mergeJson(state.items, payload),
        error: DEFAULT_STATE_ENTRIES.error,
      }
    case EntriesActionTypes.ENTRIES_SET:
      const { count, next, previous, results } = payload
      return {
        ...state,
        count,
        next,
        previous,
        ...handleFilterEntries(
          mergeJson(state.items.concat(state.filteredItems), results),
          state.search
        ),
      }
    case EntriesActionTypes.ENTRIES_SET_BY_DATE:
      return {
        ...state,
        ...handleFilterEntries(
          mergeJson(state.items.concat(state.filteredItems), payload),
          state.search
        ),
      }
    case EntriesActionTypes.ENTRY_SET:
      return {
        ...state,
        ...handleFilterEntries(
          mergeJson(state.items.concat(state.filteredItems), [payload]),
          state.search
        ),
      }
    case EntriesActionTypes.ENTRY_POST:
      return {
        ...state,
        isPending: false,
        error: DEFAULT_STATE_ENTRIES.error,
        ...handleFilterEntries(
          state.items
            .concat(state.filteredItems)
            .map((item) => (item.id === id ? payload : item)),
          state.search
        ),
      }
    case EntriesActionTypes.ENTRY_UPDATE:
      return {
        ...state,
        isPending: false,
        error: DEFAULT_STATE_ENTRIES.error,
        ...handleFilterEntries(
          state.items.concat(state.filteredItems).map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...payload,
                  _lastUpdated,
                }
              : item
          ),
          state.search
        ),
      }
    case EntriesActionTypes.ENTRY_DELETE:
      const hasArrayOfIds = Array.isArray(payload)
      const filterCondition = (item) =>
        hasArrayOfIds ? payload.includes(item.id) : item.id != id
      return {
        ...state,
        ...handleFilterEntries(
          state.items.concat(state.filteredItems).filter(filterCondition),
          state.search
        ),
      }
    case EntriesActionTypes.ENTRIES_RESET_SORT_AND_FILTER_MAP:
      return {
        ...state,
        sortMap: DEFAULT_STATE_ENTRIES.sortMap,
        filterMap: DEFAULT_STATE_ENTRIES.filterMap,
      }
    case EntriesActionTypes.ENTRIES_SET_SORT_MAP:
      const { sortKey, sortUp } = payload
      return {
        ...state,
        sortMap: { ...state.sortMap, [sortKey]: sortUp },
      }
    case EntriesActionTypes.ENTRIES_SET_FILTER_MAP:
      const { filterKey, searchValue } = payload
      return {
        ...state,
        filterMap: {
          ...state.filterMap,
          [filterKey]: searchValue,
        },
      }
    case AppActionTypes.REDUX_RESET:
      return DEFAULT_STATE_ENTRIES
    default:
      return state
  }
}

export { DEFAULT_STATE_ENTRIES, Entries }
