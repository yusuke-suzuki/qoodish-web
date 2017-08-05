require('dotenv').config();

import ReactSelector from 'testcafe-react-selectors';

fixture('Test')
  .page(`${process.env.API_ENDPOINT}`);

test('Test', async t => {
});
