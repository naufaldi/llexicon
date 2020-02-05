import { useEffect } from "react"
import PropTypes from "prop-types"
import { connect as reduxConnect } from "react-redux"
import { SetWindow, SetAppVersion } from "./actions/App"
import { GetUserSettings } from "./actions/Settings"
import { SetCalendar } from "./actions/Calendar"

const mapStateToProps = ({ User: { id } }) => ({
  UserId: id
})

const mapDispatchToProps = {
  SetWindow,
  GetUserSettings,
  SetAppVersion,
  SetCalendar
}

const App = ({
  GetUserSettings,
  UserId,
  SetAppVersion,
  SetWindow,
  SetCalendar
}) => {
  const isOnMobileBrowser = userAgent =>
    /iPhone|iPad|iPod|Android|Windows/i.test(userAgent)

  const getWindowDimensions = () => {
    const isClient = typeof window === "object"
    if (!isClient) return undefined
    const {
      innerHeight,
      innerWidth,
      screen: {
        availHeight,
        availLeft,
        availTop,
        availWidth,
        colorDepth,
        height,
        // orientation: { angle, onchange, type },
        pixelDepth,
        width
      },
      matchMedia,
      navigator: {
        appCodeName,
        appName,
        appVersion,
        bluetooth,
        clipboard,
        // connection: {
        //   downlink,
        //   effectiveType,
        //   // onchange,
        //   rtt,
        //   saveDate
        // },
        cookieEnabled,
        credentials,
        deviceMemory,
        doNotTrack,
        geolocation,
        hardwareConcurrency,
        keyboard,
        language,
        languages,
        locks,
        maxTouchPoints,
        mediaCapabilities,
        // mediaDevices: { ondevicechange },
        // mediaSession: { metadata, playbackState },
        mimeTypes,
        onLine,
        permissions,
        platform,
        plugins,
        // presentation: { defaultRequest, receiver },
        product,
        productSub,
        // serviceWorker: { controller, oncontrollerchange, onmessage },
        storage,
        usb,
        // userActivation: { hasBeenActive, isActive },
        userAgent,
        vendor,
        vendorSub
      },
      performance
    } = window

    const isMobile = innerWidth < 768

    return {
      innerHeight,
      innerWidth,
      screen: {
        availHeight,
        availLeft,
        availTop,
        availWidth,
        colorDepth,
        height,
        // orientation: { angle, onchange, type },
        pixelDepth,
        width
      },
      matchMedia,
      navigator: {
        appCodeName,
        appName,
        appVersion,
        bluetooth,
        clipboard,
        // connection: {
        //   downlink,
        //   effectiveType,
        //   // onchange,
        //   rtt,
        //   saveDate
        // },
        cookieEnabled,
        credentials,
        deviceMemory,
        doNotTrack,
        geolocation,
        hardwareConcurrency,
        keyboard,
        language,
        languages,
        locks,
        maxTouchPoints,
        mediaCapabilities,
        // mediaDevices: { ondevicechange },
        // mediaSession: { metadata, playbackState },
        mimeTypes,
        onLine,
        permissions,
        platform,
        plugins,
        // presentation: { defaultRequest, receiver },
        product,
        productSub,
        // serviceWorker: { controller, oncontrollerchange, onmessage },
        storage,
        usb,
        // userActivation: { hasBeenActive, isActive },
        userAgent,
        vendor,
        vendorSub
      },
      performance,
      isMobile,
      navBarHeight: isMobile ? 64 : 68,
      footerHeight: isMobile ? 52 : 70,
      isInStandalone: matchMedia("(display-mode: standalone)").matches,
      isOnMobileBrowser: isOnMobileBrowser(window.navigator.userAgent)
    }
  }

  useEffect(() => {
    const activeDate = new Date()

    SetCalendar({ activeDate })

    SetAppVersion()

    const handleResize = () => SetWindow(getWindowDimensions())

    window.addEventListener("resize", handleResize)

    handleResize()

    if (UserId) {
      GetUserSettings()
    }

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return null
}

App.propTypes = {
  UserId: PropTypes.number,
  SetWindow: PropTypes.func.isRequired,
  GetUserSettings: PropTypes.func.isRequired,
  SetCalendar: PropTypes.func.isRequired
}

export default reduxConnect(mapStateToProps, mapDispatchToProps)(App)
