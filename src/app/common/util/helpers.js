import moment from 'moment';

export const objectToArray = (object) => {
  if(object) {
      return Object.entries(object).map(e=>Object.assign(e[1], {id: e[0]}))
  }
}


export const createNewEvent = (user, photoURL, event) => {
  event.date = moment(event.date).toDate();
  return {
      ...event,
      hostUid: user.uid,
      hostedBy: user.displayName,
      hostPhotoURL: photoURL || '/assets/user.png',
      created: Date.now(),
      attendees: {
          [user.uid]: {
              going: true,
              joinDate: Date.now(),
              photoURL: photoURL || '/assets/user.png',
              displayName: user.displayName,
              host: true
          }
      }
  }
}


// this takes in a dataset - in our case a flat array - and each item in the data set we add an item in our hash table
// so each element in our array will have a child node
// if a.parentId != 0 then we will push child node data into the child nodes within the parents
export const createDataTree = dataset => {
    let hashTable = Object.create(null);
    dataset.forEach(a => hashTable[a.id] = {...a, childNodes: []});
    let dataTree = [];
    dataset.forEach(a => {
        if (a.parentId) hashTable[a.parentId].childNodes.push(hashTable[a.id]);
        else dataTree.push(hashTable[a.id])
    });
    return dataTree
};