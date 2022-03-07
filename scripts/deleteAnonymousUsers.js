const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = initializeApp({
  credential: applicationDefault()
});
const auth = getAuth(app);

function deleteAnonymousUsers(nextPageToken) {
  auth
    .listUsers(1000, nextPageToken)
    .then(async listUsersResult => {
      for (let userRecord of listUsersResult.users) {
        if (userRecord.providerData.length === 0) {
          console.log('Anonymous user', userRecord.toJSON());

          try {
            await auth.deleteUser(userRecord.uid);
            console.log('Successfully deleted user');
          } catch (error) {
            console.log('Error deleting user:', error);
          }
        }
      }

      if (listUsersResult.pageToken) {
        deleteAnonymousUsers(listUsersResult.pageToken);
      }
    })
    .catch(error => {
      console.log('Error listing users:', error);
    });
}

deleteAnonymousUsers();
