import React, { useEffect, useMemo, lazy, memo, Fragment } from "react"
import PropTypes from "prop-types"
import { UserProps } from "./redux/User/propTypes"
import { connect as reduxConnect } from "react-redux"
import { withRouter, Route, Switch, Redirect } from "react-router-dom"
import { SetWindow, CheckAppVersion } from "./redux/App/actions"
import { GetUserSettings } from "./redux/User/actions"
import { SetCalendar } from "./redux/Calendar/Calendar"
import {
  SyncEntries,
  GetUserEntries,
  GetUserEntryTags,
  GetUserEntryPeople,
  ResetEntriesSortAndFilterMaps,
} from "./redux/Entries/actions"
import { RouteMap, RouterGoBack } from "./routes"
import { About, Home, Entries } from "./views"
import { NavBar, PrivacyPolicy } from "./components"
import { RouterLinkPush } from "./routes"
import memoizeProps from "./helpers/memoizeProps"
import { useAddToHomescreenPrompt } from "./components/AddToHomeScreen/prompt"

const Account = lazy(() => import("./views/Account"))
const BackgroundImage = lazy(() => import("./components/BackgroundImage"))
const Settings = lazy(() => import("./views/Settings"))
const Support = lazy(() => import("./views/Support"))
const EntryDetail = lazy(() => import("./views/EntryDetail"))
const PageNotFound = lazy(() => import("./views/PageNotFound"))

const FIFTEEN_MINUTES = 1000 * 60 * 15

const {
  ABOUT,
  HOME,
  ROOT,
  NEW_ENTRY,
  LOGIN,
  SIGNUP,
  PASSWORD_RESET,
  SETTINGS,
  SETTINGS_ENTRIES,
  SETTINGS_PREFERENCES,
  SETTINGS_PROFILE,
  SUPPORT,
  ENTRIES_CALENDAR,
  ENTRY_DETAIL,
  ENTRIES,
  ENTRIES_LIST,
  ENTRIES_FOLDERS,
  ENTRIES_TABLE,
  ENTRIES_MAP,
  PRIVACY_POLICY,
} = RouteMap

const mapStateToProps = ({ User }) => ({ User })

const mapDispatchToProps = {
  SetWindow,
  GetUserSettings,
  CheckAppVersion,
  SetCalendar,
  SyncEntries,
  GetUserEntries,
  GetUserEntryTags,
  GetUserEntryPeople,
  ResetEntriesSortAndFilterMaps,
}

const App = ({
  GetUserSettings,
  User,
  CheckAppVersion,
  SetWindow,
  SetCalendar,
  SyncEntries,
  GetUserEntries,
  GetUserEntryTags,
  GetUserEntryPeople,
  ResetEntriesSortAndFilterMaps,
  history,
  location,
  match,
}) => {
  const [prompt, promptToInstall] = useAddToHomescreenPrompt()
  const addToHomeScreenProps = { prompt, promptToInstall }
  useEffect(() => {
    const activeDate = new Date()

    SetCalendar({ activeDate })
    ResetEntriesSortAndFilterMaps()

    CheckAppVersion()

    setInterval(() => CheckAppVersion(), FIFTEEN_MINUTES)

    const handleResize = () => SetWindow()

    window.addEventListener("resize", handleResize)

    handleResize()

    if (User.id) {
      SyncEntries(() => new Promise((resolve) => resolve(GetUserEntries(1))))
      GetUserSettings()
      GetUserEntryTags()
      GetUserEntryPeople()
    }

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const renderRedirectOrComponent = (shouldRedirect, component, route) => {
    if (shouldRedirect && route === "GoBack")
      return () => RouterGoBack(history, true)
    const directTo = () => RouterLinkPush(history, route)
    return shouldRedirect ? () => <Redirect push to={directTo} /> : component
  }

  const routeItems = [
    {
      path: [ABOUT],
      Render: About,
      props: addToHomeScreenProps,
      useRouteProps: true,
    },
    {
      path: [ROOT, HOME],
      Render: Home,
      props: addToHomeScreenProps,
      useRouteProps: true,
    },
    {
      path: [LOGIN, SIGNUP, PASSWORD_RESET],
      component: renderRedirectOrComponent(!!User.token, Account, "GoBack"),
    },
    {
      path: [
        SETTINGS,
        SETTINGS_ENTRIES,
        SETTINGS_PREFERENCES,
        SETTINGS_PROFILE,
      ],
      component: Settings,
    },
    {
      path: [SUPPORT],
      component: Support,
    },
    { path: [ENTRY_DETAIL], component: EntryDetail, useRouteProps: true },
    {
      path: [
        ENTRIES,
        NEW_ENTRY,
        ENTRIES_CALENDAR,
        ENTRIES_FOLDERS,
        ENTRIES_LIST,
        ENTRIES_TABLE,
        ENTRIES_MAP,
        NEW_ENTRY,
      ],
      Render: Entries,
      useRouteProps: true,
    },
    { path: [PRIVACY_POLICY], component: PrivacyPolicy },
  ]

  const renderRouteItems = useMemo(
    () =>
      routeItems.map((item, i) => {
        const { path, component, Render, props, useRouteProps } = item
        return Render ? (
          <Route
            exact={true}
            strict={false}
            key={i}
            path={path}
            render={(routeProps) =>
              useRouteProps ? (
                <Render {...props} {...routeProps} />
              ) : (
                <Render {...props} />
              )
            }
          />
        ) : (
          <Route exact key={i} path={path} component={component} />
        )
      }),
    [routeItems]
  )

  return (
    <Fragment>
      <NavBar {...addToHomeScreenProps} />
      <main className="App RouteOverlay">
        <BackgroundImage />
        <Switch>
          {renderRouteItems}
          <Route component={PageNotFound} />
        </Switch>
      </main>
    </Fragment>
  )
}

App.propTypes = {
  User: UserProps,
  SetWindow: PropTypes.func.isRequired,
  GetUserSettings: PropTypes.func.isRequired,
  CheckAppVersion: PropTypes.func.isRequired,
  SetCalendar: PropTypes.func.isRequired,
  SyncEntries: PropTypes.func.isRequired,
  GetUserEntries: PropTypes.func.isRequired,
  GetUserEntryTags: PropTypes.func.isRequired,
  GetUserEntryPeople: PropTypes.func.isRequired,
  ResetEntriesSortAndFilterMaps: PropTypes.func.isRequired,
  SetWindow: PropTypes.func.isRequired,
}

const isEqual = (prevProps, nextProps) =>
  memoizeProps(prevProps, nextProps, ["User"])

export default withRouter(
  reduxConnect(mapStateToProps, mapDispatchToProps)(memo(App, isEqual))
)
