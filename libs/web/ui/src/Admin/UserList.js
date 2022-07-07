import {
  BooleanField,
  Datagrid,
  DateField,
  EmailField,
  List,
  TextField,
} from 'react-admin'

export const UserList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="firstname" />
      <TextField source="lastname" />
      <EmailField source="email" />
      <BooleanField source="is_admin" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />{' '}
    </Datagrid>
  </List>
)
