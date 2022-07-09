import {
  Datagrid,
  DateField,
  List,
  NumberField,
  ReferenceField,
  TextField,
} from 'react-admin'

export const RatingList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <ReferenceField source="spellcheckedId" reference="spellcheckeds">
        <TextField source="request" /> 
        <span> -&gt; </span>
        <TextField source="message" />
      </ReferenceField>
      <NumberField source="rating" />
      <TextField source="user_notes" />
      <TextField source="user_correction" />
      <TextField source="admin_correction" />
      <TextField source="admin_notes" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
)
