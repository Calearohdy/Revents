import React from 'react'
import { Button, Checkbox, Icon, Table } from 'semantic-ui-react'

const TestTable = ({openModal, users}) => (
  <Table celled compact definition selectable>
    <Table.Header fullWidth>
      <Table.Row>
        <Table.HeaderCell>Share</Table.HeaderCell>
        <Table.HeaderCell>Name</Table.HeaderCell>
        <Table.HeaderCell>E-mail address</Table.HeaderCell>
        <Table.HeaderCell>Premium Plan</Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>
        {users && users.map((user, index)=> (
      <Table.Row key={index}>
      <Table.Cell collapsing>
        <Checkbox slider />
      </Table.Cell>
      <Table.Cell selectable><a href={index}>{user.title}</a></Table.Cell>
      <Table.Cell>{user.email}</Table.Cell>
      <Table.Cell>{user.plan}</Table.Cell>
    </Table.Row>
        ))}
  </Table.Body>

    <Table.Footer fullWidth>
      <Table.Row>
        <Table.HeaderCell />
        <Table.HeaderCell colSpan='4'>
          <Button onClick={() => openModal('TestModal')} floated='right' icon labelPosition='left' primary size='small'>
            <Icon name='user' /> Add User
          </Button>
        </Table.HeaderCell>
      </Table.Row>
    </Table.Footer>
  </Table>
)

export default TestTable