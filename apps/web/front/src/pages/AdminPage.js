import * as React from 'react';
import { Admin, Resource, EditGuesser } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';
import { UserList, SpellcheckedList, RatingList } from '@kreyolopal/web-ui';

const AdminPage = () => (
    <Admin
      basename="/admin"
      dataProvider={simpleRestProvider('/api/admin')}
    >
      <Resource name="users" list={UserList} edit={EditGuesser} />
      <Resource
        name="spellcheckeds"
        list={SpellcheckedList}
        edit={EditGuesser}
      />
      <Resource name="ratings" list={RatingList} edit={EditGuesser} />
    </Admin>
);

export default AdminPage;
