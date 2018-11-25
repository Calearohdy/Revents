// Query or listener that depends on the state logic defined in UserDetailedPage,
// check if user clicks on own profile or another users profile

export const userDetailedQuery = ({ auth, userUid }) => { // listener

    if (userUid !== null) {
        return [{
            collection: 'users',
            doc: userUid,
            storeAs: 'profile'
        },
        {
            collection: 'users',
            doc: userUid,
            subcollections: [{collection: 'photos'}],
            storeAs: 'photos'
        }
    ]
    } else {
    return [
      {
        collection: 'users',
        doc: auth.uid,
        subcollections: [{ collection: 'photos' }],
        storeAs: 'photos'
      }
    ]}
  };