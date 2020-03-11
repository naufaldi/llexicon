import React, { useEffect, lazy, memo } from "react"
import PropTypes from "prop-types"
import { EntriesPropTypes } from "../../redux/Entries/propTypes"
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  BreadcrumbItem,
  Button
} from "reactstrap"
import { NavLink } from "react-router-dom"
import { RouterPush } from "../../routes"
import { removeArrayDuplicates } from "../../helpers"
import "./styles.css"

const EntryCards = lazy(() => import("../EntryCards"))
const BASE_FOLDER_DIRECTORY_URL = "folders?folder=All"

const EntryFolders = ({ entries, history, location: { search } }) => {
  useEffect(() => {
    if (!search) RouterPush(history, BASE_FOLDER_DIRECTORY_URL)
  }, [])
  const directoryPath = search.replace("?folder=", "").split("+")
  const directoryTags = directoryPath.slice(1)

  const entryFilteredTags = entries.filter(entry =>
    directoryTags.every(
      tag => !!entry.tags.find(entryTag => entryTag.title === tag)
    )
  )

  const filteredEntryTags = removeArrayDuplicates(
    entryFilteredTags
      .map(entry => entry.tags.map(t => t.title))
      .flat(1)
      .filter(title => !directoryTags.includes(title))
  )

  const renderFolderBreadCrumbs = () =>
    directoryPath.map((directory, i) => {
      const newDirectory = directoryPath.slice(0, i + 1).join("+")
      const path = `?folder=${newDirectory}`
      return (
        <BreadcrumbItem key={`${directory}-${i}`}>
          <NavLink to={path}>{directory}</NavLink>
        </BreadcrumbItem>
      )
    })

  const renderFolders = () =>
    filteredEntryTags.map((title, i) => {
      const handleOnClickCallback = () =>
        RouterPush(history, search.concat(`+${title}`))

      return (
        <Col key={`${title}-${i}`} xs={6} sm={4} md={3} lg={2} className="p-1">
          <Button
            className="EntryFolder Center"
            onClick={handleOnClickCallback}
            color="accent"
          >
            {title}
          </Button>
        </Col>
      )
    })

  return (
    <Container fluid className="EntryFolders">
      <Row tag={Breadcrumb} className="FolderBreadCrumbsContainer">
        {renderFolderBreadCrumbs()}
      </Row>
      <Row className="EntryFoldersContainer">{renderFolders()}</Row>
      <Row>
        <EntryCards
          className="EntryFolderCards px-1"
          entries={entryFilteredTags}
        />
      </Row>
    </Container>
  )
}

EntryFolders.propTypes = {
  entries: EntriesPropTypes,
  history: PropTypes.object,
  location: PropTypes.object
}

EntryFolders.defaultProps = {}

export default memo(EntryFolders)
