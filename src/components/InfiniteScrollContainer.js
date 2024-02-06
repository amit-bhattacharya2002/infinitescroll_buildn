import React from 'react'
import { useState, useEffect, useRef } from 'react'


const InfiniteScrollContainer = () => {
    
    //States declaration
    const[profile, setProfile] = useState([])   //Stores the profile data
    const[page, setPage] = useState(1)          //Stores page number that has to passed in the fetch url param
    const[hasMore, setHasMore] = useState(true);    //Checks if there is more data to be fetched
    const [clickedProfile, setClickedProfile] = useState(null);     //Stores the url of the profile that is clicked on
    const elementRef = useRef(null)     //Reference for the last element, basically when this element is in the viewport more data will be loaded
    
    
    //Profile click handle - Updates the clicked profile state with the url of the profile clicked on
    const handleProfileClick = (profileUrl) => {
        setClickedProfile(profileUrl)

        //Sets the state back to null after 2 seconds - its mentioned after 1 sec in the question but because the animation is both fade in and out in 2 sec, the profile is visible for 1 sec
        setTimeout(() => {
            setClickedProfile(null)
        }, 2000)
        
        
    }

    //Fetch data async function
    const fetchData = async () => {
        try {

            const response = await fetch(`https://api.github.com/gists/public?per_page=30&page=${page}`);
            const data = await response.json();
            
            //If there is no more data to load, hasMore state is set to false, else the profile and the page state is updated
            if(data.length == 0){
                setHasMore(false)
            }else{

                setProfile((prevData) => [...prevData, ...data]);
                setPage((prevPage) => prevPage + 1);
                console.log(data)
                console.log(profile.length)
            }
            
            
        } catch (error) {
            console.error('Error fetching data:', error);
        } 
    };
    
    

        //Checks if the referenced div is in the viewport, then loads more data
      const handleObserver = (entries) => {
        const target = entries[0];
        if(target.isIntersecting && hasMore){
            fetchData();
        }
      }

      //Setting up the Intersection observer to observe the referenced div
      useEffect(() => {
        
            const observer = new IntersectionObserver(handleObserver)
            if(observer && elementRef.current){

                observer.observe(elementRef.current);
            }
        
        
        //Cleanup function
        return () => {
            if(observer){
                observer.disconnect();
            }
        }
      }, profile)   //New observer instance is created when the profile state updates
      
  return (
    <div>
        {profile.map((prof, index)=>(
            <div
                key={prof.id}

                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    borderBottom: '1px solid black',
                }}

                onClick={() => handleProfileClick(prof.owner.avatar_url)}
            >
                <img src={prof.owner.avatar_url} alt={prof.owner.login} style={{
                    width: '50px',
                    height: '50px',
                    marginRight: '50px'
                }}/>
                <div>{prof.files[Object.keys(prof.files)[0]].filename}</div>
            </div>
        ))
        }
        {clickedProfile && (
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: `50%`,
                    transform: `translate(-50%, -50%)`,
                    zIndex: '999',
                    padding: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    animation: 'fadeInOut 2s ease-in-out',

                }}
            >
                <img
                    src={clickedProfile}
                    alt='Selected User'
                    style={{width: '100px', height:'100px'}}
                />
            </div>
        )}
        {hasMore && <p ref={elementRef}>Loading...</p>}
    </div>
  )
}

export default InfiniteScrollContainer