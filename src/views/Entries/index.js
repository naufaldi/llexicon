import React, { Component, Fragment } from "react"
import { connect as reduxConnect } from "react-redux"
import PropTypes from "prop-types"
import { Row, Button, ButtonGroup } from "reactstrap"
import { withRouter } from "react-router-dom"
import { RouteMap, RouterPush } from "../../ReactRouter/Routes"
import TagsContainer from "../../components/TagsContainer"

import {
  SyncEntries,
  GetAllUserEntries,
  GetUserEntries
} from "../../actions/Entries"
import EntriesMinimal from "../../components/EntriesMinimal"
import EntriesDetailed from "../../components/EntriesDetailed"
import BasicTabs from "../../components/BasicTabs"
import BasicTable from "../../components/BasicTable"
import Moment from "react-moment"
import "./styles.css"

const mapStateToProps = ({
  User,
  Entries: { items, next, search },
  Window: {
    innerHeight,
    screen: { availHeight },
    navBarHeight
  }
}) => ({
  UserId: User.id,
  entries: items
    .filter(item => !item.shouldDelete)
    .sort(
      (a, b) =>
        new Date(b.date_created_by_author) - new Date(a.date_created_by_author)
    ),
  nextEntryPage: next,
  entriesSearch: search,
  viewPortHeight: innerHeight - navBarHeight
})

const mapDispatchToProps = { SyncEntries, GetAllUserEntries, GetUserEntries }

class Entries extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  static propTypes = {
    UserId: PropTypes.number,
    SyncEntries: PropTypes.func.isRequired,
    GetAllUserEntries: PropTypes.func.isRequired,
    GetUserEntries: PropTypes.func.isRequired
  }

  static defaultProps = {}

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      entries,
      nextEntryPage,
      viewPortHeight,
      history,
      location: { pathname }
    } = nextProps

    if (pathname === RouteMap.ENTRIES) {
      RouterPush(history, RouteMap.ENTRIES_MINIMAL)
    }

    const tabContainerHeight = 54

    const loadButtonContainerHeight = 38

    const minimalEntriesListHeight =
      viewPortHeight - tabContainerHeight - loadButtonContainerHeight

    const detailedEntriesListHeight = viewPortHeight - tabContainerHeight

    let listItemHeight = detailedEntriesListHeight / 2

    if (detailedEntriesListHeight / 3 > listItemHeight)
      listItemHeight = detailedEntriesListHeight / 3

    return {
      entries,
      nextEntryPage,
      minimalEntriesListHeight,
      detailedEntriesListHeight,
      listItemHeight,
      activeTab: pathname
    }
  }

  componentDidMount() {
    const { UserId, SyncEntries, GetUserEntries } = this.props
    if (UserId) {
      SyncEntries(() => new Promise(resolve => resolve(GetUserEntries(1))))
    }
  }

  handleDeleteEntry = id => {
    const { DeleteEntry } = this.props
    DeleteEntry(id)
  }

  handleItemsRendered = ({
    overscanStartIndex,
    overscanStopIndex,
    visibleStartIndex,
    visibleStopIndex
  }) => {
    const { entries } = this.state
    const { length } = entries
    const bottomOfListIndex = length === 0 ? length : length - 1
    const reachedBottomOfList =
      bottomOfListIndex !== 0 && overscanStopIndex === bottomOfListIndex
    // console.log("overscanStopIndex: ", overscanStopIndex)
    // console.log("visibleStopIndex: ", visibleStopIndex)
    // console.log("reachedBottomOfList: ", reachedBottomOfList)
    // console.log("---------------------------------------")

    if (reachedBottomOfList) {
      this.GetEntries()
    }
  }

  GetEntries = () => {
    const { SyncEntries, GetUserEntries, entriesSearch } = this.props
    const { nextEntryPage } = this.state

    if (entriesSearch || !nextEntryPage) {
      return
    }

    const split = nextEntryPage.split(/\?page=(.*)/)
    const pageNumber = split[1]

    SyncEntries(
      () => new Promise(resolve => resolve(GetUserEntries(pageNumber)))
    )
  }

  GetAllEntries = () => {
    const { SyncEntries, GetAllUserEntries } = this.props

    SyncEntries(() => new Promise(resolve => resolve(GetAllUserEntries())))
  }

  render() {
    const { history } = this.props
    const {
      entries,
      minimalEntriesListHeight,
      detailedEntriesListHeight,
      listItemHeight,
      activeTab,
      nextEntryPage
    } = this.state

    const tabs = [
      {
        tabId: RouteMap.ENTRIES_MINIMAL,
        title: "Minimal",
        Component: () => (
          <Fragment>
            <Row>
              <EntriesMinimal
                height={minimalEntriesListHeight}
                entries={entries}
                onItemsRendered={this.handleItemsRendered}
              />
            </Row>
            <Row className="Center" tag={ButtonGroup}>
              {nextEntryPage && (
                <Button color="accent" onClick={this.GetEntries}>
                  <i className="fas fa-cloud-download-alt" /> Load More
                </Button>
              )}

              <Button
                color="accent"
                onClick={this.GetAllEntries}
                disabled={!nextEntryPage}
              >
                <i className="fas fa-cloud-download-alt" /> Load All
              </Button>
            </Row>
          </Fragment>
        ),
        onClickCallback: () => RouterPush(history, RouteMap.ENTRIES_MINIMAL)
      },
      {
        tabId: RouteMap.ENTRIES_DETAILED,
        title: "Detailed",
        Component: () => (
          <Row>
            <EntriesDetailed
              height={detailedEntriesListHeight}
              entries={entries}
              itemSize={listItemHeight}
              onItemsRendered={this.handleItemsRendered}
            />
          </Row>
        ),
        onClickCallback: () => RouterPush(history, RouteMap.ENTRIES_DETAILED)
      },
      {
        tabId: RouteMap.ENTRIES_TABLE,
        title: "Table",
        Component: () => (
          <Row>
            <BasicTable
              columns={[
                {
                  title: value => (
                    <div>
                      <i className="fas fa-tags mr-1" />
                      Tags
                    </div>
                  ),
                  dataIndex: "tags",
                  key: "id",
                  width: 100,
                  render: tags => (
                    <TagsContainer
                      tags={tags}
                      overflowX="auto"
                    />
                  ),
                  onRowClick: id =>
                    RouterPush(
                      history,
                      RouteMap.ENTRY_DETAIL.replace(":entryId", `${id}`)
                    )
                },
                {
                  title: "Title",
                  dataIndex: "title",
                  key: "title",
                  width: "25%"
                },
                {
                  title: "Body",
                  dataIndex: "html",
                  key: "html"
                  // width: '25%'
                },
                {
                  title: "Date",
                  dataIndex: "date_created_by_author",
                  key: "date_created_by_author",
                  width: 100,
                  render: date_created_by_author => (
                    <Moment format="D MMM YY">{date_created_by_author}</Moment>
                  )
                }
              ]}
              data={entries}
            />
          </Row>
        ),
        onClickCallback: () => RouterPush(history, RouteMap.ENTRIES_TABLE)
      }
    ]

    return <BasicTabs activeTab={activeTab} tabs={tabs} />
  }
}
export default withRouter(
  reduxConnect(mapStateToProps, mapDispatchToProps)(Entries)
)
