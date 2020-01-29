import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { Table } from "reactstrap"
import TableHeader from "./TableHeader"
import TableBody from "./TableBody"
import TableFooter from "./TableFooter"
import TablePaginator from "./TablePaginator"
import deepEquals from "../../helpers/deepEquals"
import { tableSort, tableFilter } from "./functions"
import { ColumnsPropType, DataPropType } from "./props"
import "./styles.css"

class BasicTable extends Component {
  constructor(props) {
    super(props)

    const { columns, data, pageSize } = props

    let onRowClick = null

    const firstRowClickFound = columns.find(column => column.onRowClick)

    if (firstRowClickFound) {
      onRowClick = firstRowClickFound.onRowClick
    }

    this.state = {
      sortKey: null,
      sortUp: false,
      filterMap: {},
      onRowClick,
      currentPage: 0,
      pageSize
    }
  }

  static propTypes = {
    sortable: PropTypes.bool.isRequired,
    columns: ColumnsPropType,
    data: DataPropType,
    // reactstrap Table
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    size: PropTypes.string,
    bordered: PropTypes.bool,
    borderless: PropTypes.bool,
    striped: PropTypes.bool,
    dark: PropTypes.bool,
    hover: PropTypes.bool,
    responsive: PropTypes.bool,
    pageSize: PropTypes.number.isRequired,
    // Custom ref handler that will be assigned to the "ref" of the inner <table> element
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.string, PropTypes.object])
  }

  static defaultProps = {
    sortable: false,
    bordered: false,
    borderless: true,
    striped: false,
    dark: true,
    responsive: true,
    pageSize: 10,
    columns: [
      {
        title: "#",
        dataIndex: "id",
        key: "id",
        width: 25
      },
      {
        title: "First Name",
        dataIndex: "first_name",
        key: "first_name",
        width: 100,
        filter: "string"
      },
      {
        title: "Last Name",
        dataIndex: "last_name",
        key: "last_name",
        width: 200,
        filter: "string"
      },
      {
        title: "Username",
        dataIndex: "user_name",
        key: "user_name",
        render: item => <a href="#">{`Delete ${item.user_name}`}</a>,
        sort: (a, b, sortUp) =>
          sortUp ? b.user_name.localeCompare(a.user_name) : a.user_name.localeCompare(b.user_name),
        filter: searchValue => item => item.user_name.toUpperCase().includes(searchValue.toUpperCase())
      }
    ],
    data: new Array(25).fill().map(
      (e, i) =>
        (e = {
          id: i,
          first_name: `first_name${i}`,
          last_name: `last_name${i}`,
          user_name: `user_name${i}`
        })
    )
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data, columns } = nextProps

    const { sort, sortKey, sortUp, filterMap, currentPage, pageSize } = prevState

    const dataLength = data.length

    const totalPages = Math.ceil(dataLength / pageSize)

    const sliceStart = currentPage * pageSize

    const sliceEnd = sliceStart + pageSize

    let slicedData = data.slice(sliceStart, sliceEnd)

    let newData = null

    if (sortKey) {
      newData = tableSort(slicedData, sort, sortKey, sortUp)
    }

    if (Object.keys(filterMap).length > 0) {
      if (newData) {
        newData = tableFilter(newData, filterMap)
      } else {
        newData = tableFilter(slicedData, filterMap)
      }
    }

    return {
      columns,
      data: newData || slicedData,
      dataLength,
      totalPages
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const dataPropsChanged = !deepEquals(this.props.data, nextProps.data)
    const dataStateChanged = !deepEquals(this.state.data, nextState.data)

    return dataPropsChanged || dataStateChanged
  }

  handleSort = (sortKey, sort, sortUp) => {
    this.setState({ sortKey, sort, sortUp })
  }

  handleFilter = (filterKey, searchValue, filter) => {
    this.setState(currentState => {
      let newFilterMap = { ...currentState.filterMap }
      newFilterMap[filterKey] = { searchValue, filter }
      return { filterMap: newFilterMap }
    })
  }

  handlePageChange = currentPage => this.setState({ currentPage })

  handlePageSizeChange = pageSize => {
    this.setState({ pageSize })
    this.handlePageChange(0)
  }

  render() {
    const { sortable, bordered, borderless, striped, dark, responsive } = this.props
    const { columns, data, dataLength, onRowClick, currentPage, pageSize, totalPages } = this.state

    return (
      <Fragment>
        <Table
          bordered={bordered}
          borderless={borderless}
          striped={striped}
          dark={dark}
          hover={onRowClick}
          responsive={responsive}
          className="BasicTable"
        >
          <TableHeader
            sortable={sortable}
            sortCallback={(sortKey, sort, sortUp) => this.handleSort(sortKey, sort, sortUp)}
            filterCallback={(filterKey, searchValue, filter) =>
              this.handleFilter(filterKey, searchValue, filter)
            }
            columns={columns}
          />
          <TableBody sortable={sortable} onRowClick={onRowClick} columns={columns} data={data} />
          {/* <TableFooter sortable={sortable} onRowClick={onRowClick} columns={columns} data={data} /> */}
        </Table>
        <TablePaginator
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          dataLength={dataLength}
          handlePageChange={this.handlePageChange}
          handlePageSizeChange={this.handlePageSizeChange}
        />
      </Fragment>
    )
  }
}
export default BasicTable
