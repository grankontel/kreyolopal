import {
  Datagrid,
  DateField,
  List,
  ReferenceField,
  TextField,
} from 'react-admin'

export const SpellcheckedList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <ReferenceField source="userId" reference="users">
        <TextField source="email" />
      </ReferenceField>
      <TextField source="kreyol" />
      <TextField source="request" />
      <TextField source="status" />
      <TextField source="message" />
      <TextField source="response.kreyol" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
)
