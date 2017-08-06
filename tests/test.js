require('dotenv').config();

import ReactSelector from 'testcafe-react-selectors';

fixture('Test')
  .page(`${process.env.ENDPOINT}`);

test('Test', async t => {
});
