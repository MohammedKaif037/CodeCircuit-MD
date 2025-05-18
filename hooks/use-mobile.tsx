import * as React from "react"

// Define the breakpoint (in pixels) below which the device is considered "mobile"
const MOBILE_BREAKPOINT = 768

// Custom React Hook to determine if the current screen width is considered mobile
export function useIsMobile() {
  // State to store whether the device is mobile (true/false/undefined initially)
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Create a MediaQueryList object that matches when the viewport is less than MOBILE_BREAKPOINT
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Handler to update state when the screen size changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Listen for changes in the media query (screen resizing)
    mql.addEventListener("change", onChange)

    // Set the initial value based on current window width
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Cleanup: remove the event listener when the component unmounts
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return a strict boolean: true if mobile, false otherwise
  return !!isMobile
}
