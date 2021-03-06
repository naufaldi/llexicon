import React, { memo } from "react"
import "./styles.css"

const BackgroundObjects = ({ children }) => (
  <div className="BackgroundObjects">{children}</div>
)

export default memo(BackgroundObjects)
