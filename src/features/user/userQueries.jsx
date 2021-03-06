// Query or listener that depends on the state logic defined in UserDetailedPage,
// check if user clicks on own profile or another users profile

export const userDetailedQuery = ({ auth, userUid, match }) => { // listener

    if (userUid !== null) {
        // !currentUser profile
        return [{
            collection: 'users',
            doc: auth.uid,
            subcollections: [{ collection: 'following', doc: match.params.id}],
            storeAs: 'following'
          },    
        {
            collection: 'users',
            doc: userUid,
            storeAs: 'profile'
        },
        {
            collection: 'users',
            doc: userUid,
            subcollections: [{collection: 'photos'}],
            storeAs: 'photos'
        },

    ]
    } else {
    return [
        // currentUser profile
      {
        collection: 'users',
        doc: auth.uid,
        subcollections: [{ collection: 'photos' }],
        storeAs: 'photos'
      }
    ]}
  };