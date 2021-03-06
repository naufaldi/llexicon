import React, { useEffect, useMemo } from "react"
import PropTypes from "prop-types"
import { Container, Row, Col } from "reactstrap"
import { Entry } from "../../components"
import { connect as reduxConnect } from "react-redux"
import { GetUserEntryDetails, SyncEntries } from "../../redux/Entries/actions"
import PageNotFound from "../PageNotFound"
import "./styles.css"

const mapStateToProps = ({ User, Entries: { items, filteredItems } }) => ({
  UserId: User.id,
  items,
  filteredItems,
})

const mapDispatchToProps = { GetUserEntryDetails, SyncEntries }

const EntryDetail = ({
  UserId,
  items,
  filteredItems,
  SyncEntries,
  GetUserEntryDetails,
  match: {
    params: { entryId },
  },
}) => {
  const entry = useMemo(
    () => items.concat(filteredItems).find((entry) => entry.id == entryId),
    [entryId, items, filteredItems]
  )

  const readOnly = entry && UserId !== entry.author

  useEffect(() => {
    SyncEntries(
      () => new Promise((resolve) => resolve(GetUserEntryDetails(entryId)))
    )
  }, [])

  return entry ? (
    <Container className="Container">
      <Row>
        <Col xs={12} className="EntryDetail p-0">
          <Entry
            readOnly={readOnly}
            entry={entry}
            shouldRedirectOnDelete={true}
          />
        </Col>
      </Row>
    </Container>
  ) : (
    <PageNotFound
      title={"Entry Not Found. It is either deleted or no longer public."}
    />
  )
}

EntryDetail.propTypes = {
  UserId: PropTypes.number,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  filteredItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  GetUserEntryDetails: PropTypes.func.isRequired,
  SyncEntries: PropTypes.func.isRequired,
}

export default reduxConnect(mapStateToProps, mapDispatchToProps)(EntryDetail)
