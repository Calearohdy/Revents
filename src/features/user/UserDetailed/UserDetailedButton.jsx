import React from 'react'
import { Grid, Segment, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const UserDetailedButton = ({ isCurrentUser, followUser, profile, isFollowing, eventsLoading, unfollowUser}) => {
    return (
        <Grid.Column width={4}>
            <Segment> {/* will need to also have a condition to change if they are following the user or not onClick={()=> unfollowUser(followed[0])} color='teal' fluid basic content={`Unfollow ${followed[0].followName}`}*/}
                {isCurrentUser && (<Button as={Link} to='/settings' color='teal' fluid basic content='Edit Profile' />)}

                {!isCurrentUser && 
                    !isFollowing && <Button 
                                        loading={eventsLoading} 
                                        onClick={() => followUser(profile)} 
                                        color='green' fluid basic content={`Follow ${profile.displayName}`} />}
                
                {!isCurrentUser && isFollowing && <Button 
                                                    loading={eventsLoading}
                                                    onClick={() => unfollowUser(profile)} 
                                                    color='teal' fluid basic content={`Unfollow ${profile.displayName}`}/>}
                    </Segment>
        </Grid.Column>
    )
}

export default UserDetailedButton
