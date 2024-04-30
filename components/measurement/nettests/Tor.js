import { Flex, Text, theme } from 'ooni-components'
import { Cross, Tick } from 'ooni-components/icons'
import PropTypes from 'prop-types'
import React, { useMemo } from 'react'
import { FaClipboard } from 'react-icons/fa'
import { FormattedMessage, defineMessages } from 'react-intl'
import { useSortBy, useTable } from 'react-table'
import styled from 'styled-components'
import { useClipboard } from 'use-clipboard-copy'

import AccessPointStatus from '../AccessPointStatus'

const TableStyles = styled.div`
  table {
    border-spacing: 0;
    border: 1px solid black;
    table-layout: fixed;
    word-break: break-all;
    width: 100%;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }
    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      text-align: center;
      :last-child {
        border-right: 0;
      }
    }
    th {
      border-right: 1px solid black;
    }
  }
`

const StyledNameCell = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
`

const ClipboardIcon = styled.div`
  position: absolute;
  right: -3px;
  top: -5px;
`

const NameCell = ({ children }) => {
  const clipboard = useClipboard({ copiedTimeout: 1500 })

  return (
    <>
      <StyledNameCell
        title={`${children} (Click to copy)`}
        onClick={() => clipboard.copy(children)}
      >
        {children}
        <ClipboardIcon>
          {clipboard.copied && <FaClipboard size={10} color={theme.colors.green7} />}
        </ClipboardIcon>
      </StyledNameCell>

    </>
  )
}

NameCell.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]).isRequired
}

const Table = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(
    {
      columns,
      data
    },
    useSortBy
  )

  return (
    /* eslint-disable react/jsx-key */
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                {/* Sort order indicator */}
                <span>
                  {column.isSorted
                    ? column.isSortedDesc
                      ? ' 🔽'
                      : ' 🔼'
                    : ''}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )}
        )}
      </tbody>
    </table>
    /* eslint-enable react/jsx-key */

  )
}

const ConnectionStatusCell = ({ cell: { value} }) => {
  let statusIcon = null
  if (value === false) {
    statusIcon = <Text fontWeight='bold' fontSize={1} color={theme.colors.gray7}>N/A</Text>
  } else {
    statusIcon = value === null ? <Tick color={theme.colors.green7} /> : <Cross color={theme.colors.red7} />
  }
  return (
    <>
      {statusIcon} {value}
    </>
  )
}

const TorDetails = ({
  isAnomaly,
  isFailure,
  measurement,
  render
}) => {
  // https://github.com/ooni/spec/blob/master/nettests/ts-023-tor.md#possible-conclusions
  let status, hint, summaryText

  if (isFailure) {
    status = 'error'
    hint = <FormattedMessage id='Measurement.Status.Hint.Tor.Error' />
    summaryText = 'Measurement.Details.SummaryText.Tor.Error'
  } else if (isAnomaly) {
    status = 'anomaly'
    hint = <FormattedMessage id='Measurement.Status.Hint.Tor.Blocked' />
    summaryText = 'Measurement.Details.SummaryText.Tor.Blocked'
  } else {
    status = 'reachable'
    hint = <FormattedMessage id='Measurement.Status.Hint.Tor.Reachable' />
    summaryText = 'Measurement.Details.SummaryText.Tor.OK'
  }

  const testKeys = measurement?.test_keys || {}
  const {
    or_port_dirauth_accessible,
    or_port_dirauth_total,
    obfs4_accessible,
    obfs4_total,
    targets = {}
  } = testKeys

  const columns = useMemo(() => [
    {
      Header: <FormattedMessage id='Measurement.Details.Tor.Table.Header.Name' />,
      accessor: 'name',
      Cell: ({ cell: { value } }) => ( // eslint-disable-line react/display-name,react/prop-types
        <NameCell>{value}</NameCell>
      )
    },
    {
      Header: <FormattedMessage id='Measurement.Details.Tor.Table.Header.Address' />,
      accessor: 'address'
    },
    {
      Header: <FormattedMessage id='Measurement.Details.Tor.Table.Header.Type' />,
      accessor: 'type'
    },
    {
      Header: <FormattedMessage id='General.Accessible' />,
      accessor: 'failure',
      collapse: true,
      Cell: ConnectionStatusCell
    },
  ], [])

  const data = useMemo(() => (
    Object.keys(targets).map(target => {
      return {
        name: targets[target].target_name || target,
        address: targets[target].target_address,
        type: targets[target].target_protocol,
        failure: targets[target].failure,
      }
    })
  ), [targets])

  const messages = defineMessages({
    tor: {
      id: 'Measurement.Metadata.Tor',
      defaultMessage: 'Tor censorship test result in {country}'
    }
  })

  return (
    <>
      {render({
        status: status,
        statusInfo: hint,
        summaryText: summaryText,
        headMetadata: {
          message: messages.tor,
          formatted: false
        },
        details: (
          <>
            {!!Object.keys(testKeys).length &&
              <>
                <Flex my={4}>
                  <AccessPointStatus
                    width={1/2}
                    label={<FormattedMessage id='Measurement.Details.Tor.Bridges.Label.Title' />}
                    content={
                      <FormattedMessage
                        id='Measurement.Details.Tor.Bridges.Label.OK'
                        defaultMessage='{bridgesAccessible}/{bridgesTotal} OK'
                        values={{
                          bridgesAccessible: obfs4_accessible,
                          bridgesTotal: obfs4_total
                        }}
                      />
                    }
                    ok={true}
                    color='blue5'
                  />
                  <AccessPointStatus
                    width={1/2}
                    label={<FormattedMessage id='Measurement.Details.Tor.DirAuth.Label.Title' />}
                    content={
                      <FormattedMessage
                        id='Measurement.Details.Tor.DirAuth.Label.OK'
                        defaultMessage='{dirAuthAccessible}/{dirAuthTotal} OK'
                        values={{
                          dirAuthAccessible: or_port_dirauth_accessible,
                          dirAuthTotal: or_port_dirauth_total
                        }}
                      />
                    }
                    ok={true}
                    color='blue5'
                  />
                </Flex>
                <TableStyles>
                  <Table
                    columns={columns}
                    data={data}
                  />
                </TableStyles>
              </>
            }
          </>
        )
      })}
    </>
  )
}

TorDetails.propTypes = {
  render: PropTypes.func,
  measurement: PropTypes.object.isRequired,
  country: PropTypes.string.isRequired
}

export default TorDetails
